export interface Transaction {
  id: string;                    // UUID primary key
  amount: number;               // Numeric amount for calculations
  currency: string;             // "COP" for Colombian Peso
  senderName: string;          // Parsed sender name from SMS
  accountNumber: string;       // Last 4 digits (e.g., "**7251")
  date: Date;                  // Transaction date
  time: string;                // Transaction time (HH:mm format)
  rawMessage: string;          // Original SMS message
  parsedAt: Date;              // When parsing occurred
  webhookId: string;           // Unique webhook identifier
  status: 'processed' | 'failed' | 'duplicate';
}

export interface ParseError {
  id: string;                    // UUID primary key
  rawMessage: string;           // Original SMS that failed parsing
  errorReason: string;          // Specific parsing error message
  webhookId: string;            // Associated webhook ID
  occurredAt: Date;             // When error occurred
  resolved: boolean;            // Manual resolution status
}

// Database row types (snake_case as returned from Supabase)
export interface DatabaseTransaction {
  id: string;
  amount: string;               // DECIMAL comes as string from database
  currency: string;
  sender_name: string;
  account_number: string;
  transaction_date: string;     // DATE comes as string
  transaction_time: string;     // TIME comes as string
  raw_message: string;
  parsed_at: string;            // TIMESTAMP comes as string
  webhook_id: string;
  status: string;
  created_at: string;           // TIMESTAMP comes as string
}

export interface DatabaseParseError {
  id: string;
  raw_message: string;
  error_reason: string;
  webhook_id: string;
  occurred_at: string;          // TIMESTAMP comes as string
  resolved: boolean;
}

export interface DashboardMetrics {
  period: 'daily' | 'weekly' | 'monthly';
  totalAmount: number;         // Sum of all amounts in period
  transactionCount: number;    // Count of transactions
  averageAmount: number;       // Average transaction amount
  periodStart: Date;           // Period start boundary
  periodEnd: Date;             // Period end boundary
  lastUpdated: Date;           // Cache invalidation timestamp
}

export interface MetricCard {
  title: string;
  value: number;
  currency: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  period: 'daily' | 'weekly' | 'monthly' | 'average';
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  amount?: number;
}

export interface DashboardFilters {
  startDate: Date | null;
  endDate: Date | null;
  searchTerm: string;
  accountFilter: string;
  senderFilter: string;
}

export interface DashboardState {
  transactions: Transaction[];
  metrics: MetricCard[];
  filters: DashboardFilters;
  isLoading: boolean;
  error: string | null;
}

// Webhook endpoint types
export interface WebhookRequest {
  message: string;
  timestamp: string;
  phone: string;
  webhookId: string;
}

export interface WebhookResponse {
  status: 'processed' | 'error' | 'duplicate';
  transactionId?: string;
  webhookId: string;
  error?: string;
}

export interface ParsedMessage {
  amount: number;
  senderName: string;
  account: string;
  date: Date;
  time: string;
  success: boolean;
  errorReason?: string;
}