import { supabase, createServerClient } from './supabase'
import { Transaction, ParseError, DatabaseTransaction, DatabaseParseError } from './types'

// Transform database row to application interface
export function transformTransaction(dbRow: DatabaseTransaction): Transaction {
  return {
    id: dbRow.id,
    amount: parseFloat(dbRow.amount),
    currency: dbRow.currency,
    senderName: dbRow.sender_name,
    accountNumber: dbRow.account_number,
    date: new Date(dbRow.transaction_date),
    time: dbRow.transaction_time,
    rawMessage: dbRow.raw_message,
    parsedAt: new Date(dbRow.parsed_at),
    webhookId: dbRow.webhook_id,
    status: dbRow.status as 'processed' | 'failed' | 'duplicate'
  }
}

export function transformParseError(dbRow: DatabaseParseError): ParseError {
  return {
    id: dbRow.id,
    rawMessage: dbRow.raw_message,
    errorReason: dbRow.error_reason,
    webhookId: dbRow.webhook_id,
    occurredAt: new Date(dbRow.occurred_at),
    resolved: dbRow.resolved
  }
}

// Transaction database operations
export class TransactionDatabase {
  
  // Insert new transaction (webhook usage)
  static async insertTransaction(data: {
    amount: number;
    currency: string;
    senderName: string;
    accountNumber: string;
    transactionDate: Date;
    transactionTime: string;
    rawMessage: string;
    webhookId: string;
    status?: 'processed' | 'failed' | 'duplicate';
  }) {
    const serverClient = createServerClient()
    
    const { data: result, error } = await serverClient
      .from('transactions')
      .insert({
        amount: data.amount.toString(),
        currency: data.currency,
        sender_name: data.senderName,
        account_number: data.accountNumber,
        transaction_date: data.transactionDate.toISOString().split('T')[0],
        transaction_time: data.transactionTime,
        raw_message: data.rawMessage,
        webhook_id: data.webhookId,
        status: data.status || 'processed'
      })
      .select()
      .single()

    if (error) throw error
    return result ? transformTransaction(result) : null
  }

  // Get transactions with filters and pagination
  static async getTransactions(filters: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.startDate) {
      query = query.gte('transaction_date', filters.startDate.toISOString().split('T')[0])
    }
    
    if (filters.endDate) {
      query = query.lte('transaction_date', filters.endDate.toISOString().split('T')[0])
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data ? data.map(transformTransaction) : []
  }

  // Get single transaction by webhook ID
  static async getTransactionByWebhookId(webhookId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('webhook_id', webhookId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data ? transformTransaction(data) : null
  }

  // Get transaction metrics for dashboard
  static async getTransactionMetrics(filters: {
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    let query = supabase
      .from('transactions')
      .select('amount, transaction_date, status')

    if (filters.startDate) {
      query = query.gte('transaction_date', filters.startDate.toISOString().split('T')[0])
    }
    
    if (filters.endDate) {
      query = query.lte('transaction_date', filters.endDate.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) throw error
    
    const transactions = data || []
    const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    const transactionCount = transactions.length
    const averageAmount = transactionCount > 0 ? totalAmount / transactionCount : 0

    return {
      totalAmount,
      transactionCount,
      averageAmount,
      lastUpdated: new Date()
    }
  }
}

// Parse error database operations
export class ParseErrorDatabase {
  
  // Insert parse error (webhook usage)
  static async insertParseError(data: {
    rawMessage: string;
    errorReason: string;
    webhookId: string;
  }) {
    const serverClient = createServerClient()
    
    const { data: result, error } = await serverClient
      .from('parse_errors')
      .insert({
        raw_message: data.rawMessage,
        error_reason: data.errorReason,
        webhook_id: data.webhookId
      })
      .select()
      .single()

    if (error) throw error
    return result ? transformParseError(result) : null
  }

  // Get parse errors with pagination
  static async getParseErrors(filters: {
    resolved?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    let query = supabase
      .from('parse_errors')
      .select('*')
      .order('occurred_at', { ascending: false })

    if (typeof filters.resolved === 'boolean') {
      query = query.eq('resolved', filters.resolved)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data ? data.map(transformParseError) : []
  }

  // Mark parse error as resolved
  static async resolveParseError(id: string) {
    const { data, error } = await supabase
      .from('parse_errors')
      .update({ resolved: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data ? transformParseError(data) : null
  }
}