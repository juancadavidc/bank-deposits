import { create } from 'zustand';
import { Transaction, DashboardMetrics } from '@/lib/types';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, isWithinInterval } from 'date-fns';

interface FilterState {
  searchTerm: string;
  dateRange: { start: Date; end: Date };
  statusFilter: string;
}

interface DashboardStore {
  // Data State
  transactions: Transaction[];
  metrics: Record<string, DashboardMetrics>;
  loading: boolean;
  error: string | null;
  
  // Filter State (for future stories)
  searchTerm: string;
  dateRange: { start: Date; end: Date };
  statusFilter: string;
  
  // Actions
  addTransaction: (transaction: Transaction) => void;
  setTransactions: (transactions: Transaction[]) => void;
  updateMetrics: (period: string, metrics: DashboardMetrics) => void;
  calculateMetrics: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const calculatePeriodMetrics = (
  transactions: Transaction[], 
  period: 'daily' | 'weekly' | 'monthly',
  referenceDate: Date = new Date()
): DashboardMetrics => {
  let periodStart: Date;
  let periodEnd: Date;
  
  switch (period) {
    case 'daily':
      periodStart = startOfDay(referenceDate);
      periodEnd = endOfDay(referenceDate);
      break;
    case 'weekly':
      periodStart = startOfWeek(referenceDate, { weekStartsOn: 1 }); // Monday start
      periodEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
      break;
    case 'monthly':
      periodStart = startOfMonth(referenceDate);
      periodEnd = endOfMonth(referenceDate);
      break;
  }
  
  // Filter transactions within the period and only processed ones
  const periodTransactions = transactions.filter(transaction => 
    transaction.status === 'processed' &&
    isWithinInterval(transaction.date, { start: periodStart, end: periodEnd })
  );
  
  const totalAmount = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
  const transactionCount = periodTransactions.length;
  const averageAmount = transactionCount > 0 ? totalAmount / transactionCount : 0;
  
  return {
    period,
    totalAmount,
    transactionCount,
    averageAmount,
    periodStart,
    periodEnd,
    lastUpdated: new Date()
  };
};

const initialDateRange = {
  start: startOfMonth(new Date()),
  end: endOfMonth(new Date())
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  transactions: [],
  metrics: {},
  loading: false,
  error: null,
  searchTerm: '',
  dateRange: initialDateRange,
  statusFilter: 'all',
  
  // Actions
  addTransaction: (transaction) => {
    set((state) => {
      const updatedTransactions = [...state.transactions, transaction];
      return { transactions: updatedTransactions };
    });
    // Recalculate metrics after adding transaction
    get().calculateMetrics();
  },
  
  setTransactions: (transactions) => {
    set({ transactions });
    get().calculateMetrics();
  },
  
  updateMetrics: (period, metrics) => {
    set((state) => ({
      metrics: { ...state.metrics, [period]: metrics }
    }));
  },
  
  calculateMetrics: () => {
    const { transactions } = get();
    const now = new Date();
    
    // Calculate metrics for all periods
    const dailyMetrics = calculatePeriodMetrics(transactions, 'daily', now);
    const weeklyMetrics = calculatePeriodMetrics(transactions, 'weekly', now);
    const monthlyMetrics = calculatePeriodMetrics(transactions, 'monthly', now);
    
    set({
      metrics: {
        daily: dailyMetrics,
        weekly: weeklyMetrics,
        monthly: monthlyMetrics
      }
    });
  },
  
  setFilters: (filters) => {
    set((state) => ({
      searchTerm: filters.searchTerm ?? state.searchTerm,
      dateRange: filters.dateRange ?? state.dateRange,
      statusFilter: filters.statusFilter ?? state.statusFilter
    }));
  },
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null })
}));