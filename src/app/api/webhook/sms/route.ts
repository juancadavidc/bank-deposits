import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseBancolombiaSMS, validateWebhookPayload } from '@/lib/sms-parser';
import { WebhookRequest, WebhookResponse } from '@/lib/types';

// Runtime configuration for Vercel Edge Function
export const runtime = 'edge';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.WEBHOOK_SECRET;

// CORS headers for webhook responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '3600',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Environment validation
    if (!supabaseUrl || !supabaseServiceKey || !webhookSecret) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { status: 'error', error: 'Server configuration error' } as WebhookResponse,
        { status: 500, headers: corsHeaders }
      );
    }

    // Bearer token authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { status: 'error', error: 'Missing or invalid authorization header' } as WebhookResponse,
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== webhookSecret) {
      return NextResponse.json(
        { status: 'error', error: 'Invalid webhook token' } as WebhookResponse,
        { status: 401, headers: corsHeaders }
      );
    }

    // Content-Type validation
    const contentType = request.headers.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { status: 'error', error: 'Content-Type must be application/json' } as WebhookResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse request body
    let webhookData: WebhookRequest;
    try {
      const body = await request.json();
      if (!validateWebhookPayload(body)) {
        return NextResponse.json(
          { status: 'error', error: 'Invalid webhook payload format' } as WebhookResponse,
          { status: 400, headers: corsHeaders }
        );
      }
      webhookData = body as WebhookRequest;
    } catch {
      return NextResponse.json(
        { status: 'error', error: 'Invalid JSON payload' } as WebhookResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check for duplicate webhookId
    const { data: existingTransaction, error: duplicateError } = await supabase
      .from('transactions')
      .select('id, webhook_id')
      .eq('webhook_id', webhookData.webhookId)
      .single();

    if (duplicateError && duplicateError.code !== 'PGRST116') {
      console.error('Database error checking duplicates:', duplicateError);
      return NextResponse.json(
        { status: 'error', error: 'Database connection error', webhookId: webhookData.webhookId } as WebhookResponse,
        { status: 500, headers: corsHeaders }
      );
    }

    if (existingTransaction) {
      return NextResponse.json(
        { 
          status: 'duplicate', 
          transactionId: existingTransaction.id, 
          webhookId: webhookData.webhookId 
        } as WebhookResponse,
        { status: 200, headers: corsHeaders }
      );
    }

    // Parse SMS message
    const parsedMessage = parseBancolombiaSMS(webhookData.message);
    
    if (!parsedMessage.success) {
      // Insert parse error
      const { error: parseErrorInsertError } = await supabase
        .from('parse_errors')
        .insert({
          raw_message: webhookData.message,
          error_reason: parsedMessage.errorReason || 'Unknown parsing error',
          webhook_id: webhookData.webhookId,
          occurred_at: new Date().toISOString(),
          resolved: false
        });

      if (parseErrorInsertError) {
        console.error('Failed to insert parse error:', parseErrorInsertError);
      }

      return NextResponse.json(
        { 
          status: 'error', 
          error: `Parse failed: ${parsedMessage.errorReason}`,
          webhookId: webhookData.webhookId 
        } as WebhookResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // Insert successful transaction
    const transactionData = {
      amount: parsedMessage.amount.toString(),
      currency: 'COP',
      sender_name: parsedMessage.senderName,
      account_number: parsedMessage.account,
      transaction_date: parsedMessage.date.toISOString().split('T')[0],
      transaction_time: parsedMessage.time,
      raw_message: webhookData.message,
      parsed_at: new Date().toISOString(),
      webhook_id: webhookData.webhookId,
      status: 'processed'
    };

    const { data: insertedTransaction, error: insertError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to insert transaction:', insertError);
      
      // Log the failure as a parse error for debugging
      await supabase
        .from('parse_errors')
        .insert({
          raw_message: webhookData.message,
          error_reason: `Database insert failed: ${insertError.message}`,
          webhook_id: webhookData.webhookId,
          occurred_at: new Date().toISOString(),
          resolved: false
        });

      return NextResponse.json(
        { status: 'error', error: 'Failed to store transaction', webhookId: webhookData.webhookId } as WebhookResponse,
        { status: 500, headers: corsHeaders }
      );
    }

    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log performance metrics
    console.log(`Webhook processed successfully in ${responseTime}ms`, {
      webhookId: webhookData.webhookId,
      transactionId: insertedTransaction.id,
      amount: parsedMessage.amount,
      responseTime
    });

    return NextResponse.json(
      { 
        status: 'processed', 
        transactionId: insertedTransaction.id, 
        webhookId: webhookData.webhookId 
      } as WebhookResponse,
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Webhook processing failed after ${responseTime}ms:`, error);
    
    return NextResponse.json(
      { status: 'error', error: 'Internal server error' } as WebhookResponse,
      { status: 500, headers: corsHeaders }
    );
  }
}

// Rate limiting would be handled by Vercel's built-in protection
// Additional rate limiting can be added via middleware if needed