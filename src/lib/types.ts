export interface Transaction {
  id: string;                    // UUID primary key
  amount: number;               // Numeric amount for calculations
  currency: string;             // "COP" for Colombian Peso
  senderName: string;          // Parsed sender name from SMS
  accountNumber: string;       // Last 4 digits (e.g., "**7251")
  date: Date;                  // Transaction date
  time: string;                // Transaction time (HH:mm format)
  rawMessage: string;          // Original SMS message (mock version)
  parsedAt: Date;              // When parsing occurred
  webhookId: string;           // Unique webhook identifier (mock)
  status: 'processed' | 'failed' | 'duplicate';
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