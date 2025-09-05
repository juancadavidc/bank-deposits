'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardStore } from '@/stores/dashboard';
import { DashboardMetrics } from '@/lib/types';

interface MetricCardProps {
  title: string;
  metrics: DashboardMetrics;
  previousMetrics?: DashboardMetrics;
  variant?: 'trust' | 'growth' | 'premium' | 'prosperity';
}

function MetricCard({ title, metrics, previousMetrics, variant = 'trust' }: MetricCardProps) {
  // Neuromarketing color classes based on psychological impact
  const getVariantClasses = (variant: string) => {
    const variants = {
      trust: {
        card: 'neuro-trust hover:shadow-md transition-all duration-200',
        title: 'neuro-trust-text uppercase tracking-wider',
        metric: 'neuro-trust-metric mb-1',
        badge: 'neuro-trust-badge banking-subtle'
      },
      growth: {
        card: 'neuro-growth hover:shadow-md transition-all duration-200',
        title: 'neuro-growth-text uppercase tracking-wider',
        metric: 'neuro-growth-metric mb-1',
        badge: 'neuro-growth-badge banking-subtle'
      },
      premium: {
        card: 'neuro-premium hover:shadow-md transition-all duration-200',
        title: 'neuro-premium-text uppercase tracking-wider',
        metric: 'neuro-premium-metric mb-1',
        badge: 'neuro-premium-badge banking-subtle'
      },
      prosperity: {
        card: 'neuro-prosperity hover:shadow-md transition-all duration-200',
        title: 'neuro-prosperity-text uppercase tracking-wider',
        metric: 'neuro-prosperity-metric mb-1',
        badge: 'neuro-prosperity-badge banking-subtle'
      }
    };
    return variants[variant as keyof typeof variants] || variants.trust;
  };
  
  const classes = getVariantClasses(variant);
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
    <Card className={classes.card}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={classes.title}>
          {title}
        </CardTitle>
        <Badge variant="secondary" className={classes.badge}>
          {metrics.transactionCount} transacciones
        </Badge>
      </CardHeader>
      <CardContent>
        <div className={classes.metric}>
          {formatCurrency(metrics.totalAmount)}
        </div>
        <div className="banking-subtle mb-2">
          Promedio: <span className="banking-amount">{formatCurrency(metrics.averageAmount)}</span>
        </div>
        {change && (
          <div className={`banking-subtle flex items-center ${
            change.isIncrease 
              ? 'text-primary opacity-70' 
              : 'text-destructive opacity-70'
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
          <Card key={index} className="banking-elegant animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
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
        variant="trust"
      />
      
      <MetricCard
        title="Esta Semana"
        metrics={weeklyMetrics}
        variant="growth"
      />
      
      <MetricCard
        title="Este Mes" 
        metrics={monthlyMetrics}
        variant="premium"
      />
      
      <Card className="neuro-prosperity hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="neuro-prosperity-text uppercase tracking-wider">
            Promedio
          </CardTitle>
          <Badge variant="secondary" className="neuro-prosperity-badge banking-subtle">
            Todas las transacciones
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="neuro-prosperity-metric mb-1">
            ${overallAverage.toLocaleString('es-CO', { 
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}
          </div>
          <div className="banking-subtle">
            Por transacción
          </div>
        </CardContent>
      </Card>
    </div>
  );
}