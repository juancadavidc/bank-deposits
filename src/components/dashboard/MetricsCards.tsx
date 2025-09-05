'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardStore } from '@/stores/dashboard';
import { DashboardMetrics } from '@/lib/types';

interface MetricCardProps {
  title: string;
  metrics: DashboardMetrics;
  previousMetrics?: DashboardMetrics;
}

function MetricCard({ title, metrics, previousMetrics }: MetricCardProps) {
  // Colombian Peso formatting with period as thousands separator
  const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString('es-CO', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  // Calculate percentage change vs previous period
  const calculateChange = (): { percentage: number; isIncrease: boolean } | null => {
    if (!previousMetrics || previousMetrics.totalAmount === 0) return null;
    
    const currentAmount = metrics.totalAmount;
    const previousAmount = previousMetrics.totalAmount;
    const percentage = ((currentAmount - previousAmount) / previousAmount) * 100;
    
    return {
      percentage: Math.abs(percentage),
      isIncrease: percentage > 0
    };
  };

  const change = calculateChange();

  return (
    <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-white shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-green-800">
          {title}
        </CardTitle>
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
          {metrics.transactionCount} transacciones
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-900 mb-1">
          {formatCurrency(metrics.totalAmount)}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          Promedio: {formatCurrency(metrics.averageAmount)}
        </div>
        {change && (
          <div className={`text-xs flex items-center ${
            change.isIncrease 
              ? 'text-green-600' 
              : 'text-red-500'
          }`}>
            <span className="mr-1">
              {change.isIncrease ? '↗' : '↘'}
            </span>
            {change.percentage.toFixed(1)}% vs período anterior
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MetricsCards() {
  const { metrics, loading } = useDashboardStore();
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Default empty metrics for when no data is available
  const getDefaultMetrics = (period: 'daily' | 'weekly' | 'monthly'): DashboardMetrics => ({
    period,
    totalAmount: 0,
    transactionCount: 0,
    averageAmount: 0,
    periodStart: new Date(),
    periodEnd: new Date(),
    lastUpdated: new Date()
  });

  const dailyMetrics = metrics.daily || getDefaultMetrics('daily');
  const weeklyMetrics = metrics.weekly || getDefaultMetrics('weekly');
  const monthlyMetrics = metrics.monthly || getDefaultMetrics('monthly');
  
  // Calculate overall average from all processed transactions
  const allTransactions = useDashboardStore.getState().transactions.filter(t => t.status === 'processed');
  const overallAverage = allTransactions.length > 0 
    ? allTransactions.reduce((sum, t) => sum + t.amount, 0) / allTransactions.length 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Hoy"
        metrics={dailyMetrics}
      />
      
      <MetricCard
        title="Esta Semana"
        metrics={weeklyMetrics}
      />
      
      <MetricCard
        title="Este Mes" 
        metrics={monthlyMetrics}
      />
      
      <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">
            Promedio
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
            Todas las transacciones
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 mb-1">
            ${overallAverage.toLocaleString('es-CO', { 
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </div>
          <div className="text-sm text-gray-600">
            Por transacción
          </div>
        </CardContent>
      </Card>
    </div>
  );
}