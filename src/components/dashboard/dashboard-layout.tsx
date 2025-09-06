'use client';

import DashboardHeader from './dashboard-header';
import MetricsCards from './MetricsCards';
import ChartsGrid from './ChartsGrid';
import { FilterBar } from './FilterBar';
import { TransactionTable } from './TransactionTable';
import { RealTimeIndicator } from './RealTimeIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDataLoader } from '@/hooks/useDataLoader';

export default function DashboardLayout() {
  // Initialize real data loading
  const { error } = useDataLoader();

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-4 md:py-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">⚠️ {error}</p>
          </div>
        )}
        {/* Real-time Status Indicator */}
        <div className="mb-4">
          <RealTimeIndicator />
        </div>

        {/* Metrics Cards Section */}
        <MetricsCards />

        {/* Filter Section */}
        <div className="mb-4 md:mb-6">
          <FilterBar />
        </div>
        
        {/* Charts Section - Story 1.4 Implementation */}
        <div className="mb-4 md:mb-6">
          <ChartsGrid />
        </div>
        
        {/* Transaction Table Section */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle>Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}