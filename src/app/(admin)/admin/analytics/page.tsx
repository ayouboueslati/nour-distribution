'use client';

import { useState, useMemo } from 'react';
import { Card, Button, Badge} from "../../../components/ui/index";
import Link from 'next/link';
import { 
  PerformanceChart, 
  RevenueExpenseBarChart, 
  ExpensePieChart, 
  ProfitMarginChart,
  MonthlyComparisonChart 
} from './components/charts/FinancialCharts';

// Types
interface FinancialData {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

interface ChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartView, setChartView] = useState<'performance' | 'revenue' | 'profit' | 'comparison'>('performance');

  // Mock data - in real app, this would come from API
  const financialData: FinancialData = {
    revenue: 45230,
    expenses: 28750,
    profit: 16480,
    margin: 36.4
  };

  // Performance chart data
  const performanceData: ChartData[] = [
    { month: 'Jan', revenue: 42000, expenses: 26500, profit: 15500, margin: 36.9 },
    { month: 'Fév', revenue: 38500, expenses: 24200, profit: 14300, margin: 37.1 },
    { month: 'Mar', revenue: 45230, expenses: 28750, profit: 16480, margin: 36.4 },
    { month: 'Avr', revenue: 41000, expenses: 25500, profit: 15500, margin: 37.8 },
    { month: 'Mai', revenue: 47800, expenses: 30200, profit: 17600, margin: 36.8 },
    { month: 'Juin', revenue: 44500, expenses: 27800, profit: 16700, margin: 37.5 }
  ];

  // Expense breakdown for pie chart
  const expensePieData = [
    { name: 'Achats Fournisseurs', value: 18500 },
    { name: 'Frais Opérationnels', value: 4500 },
    { name: 'Transport & Livraison', value: 3200 },
    { name: 'Marketing', value: 1500 },
    { name: 'Divers', value: 1050 }
  ];

  // Monthly comparison data
  const comparisonData = [
    { month: 'Jan', thisYear: 42000, lastYear: 38000 },
    { month: 'Fév', thisYear: 38500, lastYear: 36500 },
    { month: 'Mar', thisYear: 45230, lastYear: 41000 },
    { month: 'Avr', thisYear: 41000, lastYear: 39500 },
    { month: 'Mai', thisYear: 47800, lastYear: 42500 },
    { month: 'Juin', thisYear: 44500, lastYear: 40800 }
  ];

  const expenseCategories: ExpenseCategory[] = [
    { category: 'Achats Fournisseurs', amount: 18500, percentage: 64.3, trend: 'up' },
    { category: 'Frais Opérationnels', amount: 4500, percentage: 15.7, trend: 'stable' },
    { category: 'Transport & Livraison', amount: 3200, percentage: 11.1, trend: 'down' },
    { category: 'Marketing', amount: 1500, percentage: 5.2, trend: 'up' },
    { category: 'Divers', amount: 1050, percentage: 3.7, trend: 'stable' }
  ];

  // Automated data sources
  const automatedSources = [
    { name: 'Ventes Facturées', amount: 45230, source: 'factures', accuracy: 'high' },
    { name: 'Achats Fournisseurs', amount: 18500, source: 'suppliers', accuracy: 'high' },
    { name: 'Charges Manuelles', amount: 10250, source: 'manual', accuracy: 'medium' }
  ];

  // Smart insights
  const insights = [
    "Vos frais d'achat représentent 64% de vos dépenses totales",
    "Marge bénéficiaire en hausse de 2% ce mois-ci",
    "Dépenses de transport en baisse de 8% par rapport au mois dernier",
    "Recommandation: Négocier de meilleurs prix avec vos principaux fournisseurs"
  ];

  // Filter data based on time range
  const filteredData = useMemo(() => {
    switch (timeRange) {
      case 'week':
        return performanceData.slice(-1);
      case 'month':
        return performanceData.slice(-3);
      case 'quarter':
        return performanceData.slice(-6);
      case 'year':
        return performanceData;
      default:
        return performanceData;
    }
  }, [timeRange]);

  const getTrendVariant = (trend: string) => {
    switch (trend) {
      case 'up': return 'danger';
      case 'down': return 'success';
      default: return 'warning';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  // Render the appropriate chart based on view
  const renderMainChart = () => {
    switch (chartView) {
      case 'performance':
        return <PerformanceChart data={filteredData} />;
      case 'revenue':
        return <RevenueExpenseBarChart data={filteredData} />;
      case 'profit':
        return <ProfitMarginChart data={filteredData} />;
      case 'comparison':
        return <MonthlyComparisonChart data={comparisonData} />;
      default:
        return <PerformanceChart data={filteredData} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-stone-800">Analytics & Rapports</h1>
          <p className="text-stone-600 mt-1">Suivez vos performances financières et optimisez vos coûts</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/analytics/charges">
            <Button variant="secondary">
              💰 Gérer les Charges
            </Button>
          </Link>
          <Button variant="primary">
            📥 Exporter Rapport
          </Button>
        </div>
      </div>

      {/* Time Range & Chart Type Selector */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-2">
              {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                    timeRange === range
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {range === 'week' && 'Cette Semaine'}
                  {range === 'month' && 'Ce Mois'}
                  {range === 'quarter' && 'Ce Trimestre'}
                  {range === 'year' && 'Cette Année'}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'performance', label: '📊 Performance', icon: '📊' },
                { key: 'revenue', label: '💰 Revenus vs Charges', icon: '💰' },
                { key: 'profit', label: '🎯 Marge', icon: '🎯' },
                { key: 'comparison', label: '🔄 Comparaison', icon: '🔄' }
              ] as const).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setChartView(key)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                    chartView === key
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Chiffre d'Affaires"
          value={`${financialData.revenue.toLocaleString()}€`}
          change="+12.5%"
          trend="up"
          icon="💰"
          description="Revenus totaux ce mois"
        />
        <MetricCard
          title="Charges Totales"
          value={`${financialData.expenses.toLocaleString()}€`}
          change="+8.2%"
          trend="up"
          icon="💸"
          description="Dépenses totales ce mois"
        />
        <MetricCard
          title="Bénéfice Net"
          value={`${financialData.profit.toLocaleString()}€`}
          change="+18.3%"
          trend="up"
          icon="🎯"
          description="Profit après charges"
        />
        <MetricCard
          title="Marge Bénéficiaire"
          value={`${financialData.margin}%`}
          change="+2.1%"
          trend="up"
          icon="📈"
          description="Ratio profit/revenus"
        />
      </div>

      {/* Charts & Data Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">
                {chartView === 'performance' && 'Performance Financière'}
                {chartView === 'revenue' && 'Revenus vs Charges'}
                {chartView === 'profit' && 'Évolution de la Marge'}
                {chartView === 'comparison' && 'Comparaison Annuelle'}
              </h2>
              <div className="h-80">
                {renderMainChart()}
              </div>
            </div>
          </Card>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Expense Breakdown */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">
                Répartition des Charges
              </h2>
              <div className="h-80">
                <ExpensePieChart data={expensePieData} />
              </div>
            </div>
          </Card>

          {/* Data Sources */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">
                Sources de Données
              </h2>
              <div className="space-y-3">
                {automatedSources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <div>
                      <p className="font-medium text-stone-800">{source.name}</p>
                      <p className="text-sm text-stone-500">
                        Source: {source.source === 'factures' ? 'Factures' : 
                                source.source === 'suppliers' ? 'Fournisseurs' : 'Manuelle'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{source.amount.toLocaleString()}€</p>
                      <Badge 
                        variant={source.accuracy === 'high' ? 'success' : 'warning'} 
                        size="sm"
                      >
                        {source.accuracy === 'high' ? 'Précis' : 'Estimé'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Expense Categories Breakdown */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">
            Analyse Détaillée des Charges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {expenseCategories.map((category, index) => (
              <div key={category.category} className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-red-500' :
                    index === 1 ? 'bg-blue-500' :
                    index === 2 ? 'bg-green-500' :
                    index === 3 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`} />
                </div>
                <p className="font-medium text-stone-800 text-sm mb-1">{category.category}</p>
                <p className="text-lg font-semibold text-stone-800">{category.amount.toLocaleString()}€</p>
                <p className="text-sm text-stone-500">{category.percentage}% du total</p>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <span className="text-sm">{getTrendIcon(category.trend)}</span>
                  <Badge variant={getTrendVariant(category.trend)} size="sm">
                    {category.trend === 'up' ? 'Hausse' : category.trend === 'down' ? 'Baisse' : 'Stable'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Insights & Recommendations */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">
            💡 Insights & Recommandations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="📋 Rapport Détaillé"
          description="Générer un rapport PDF complet"
          action="Générer"
          onClick={() => console.log('Generate report')}
          color="bg-blue-500"
        />
        <QuickActionCard
          title="🔍 Analyse Avancée"
          description="Analyses détaillées par segment"
          action="Explorer"
          onClick={() => console.log('Advanced analysis')}
          color="bg-green-500"
        />
        <QuickActionCard
          title="🎯 Objectifs"
          description="Définir et suivre les objectifs"
          action="Configurer"
          onClick={() => console.log('Set goals')}
          color="bg-purple-500"
        />
      </div>
    </div>
  );
}

// Supporting Components (keep the same MetricCard and QuickActionCard from previous version)
function MetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  description 
}: { 
  title: string; 
  value: string; 
  change: string; 
  trend: 'up' | 'down' | 'stable';
  icon: string;
  description: string;
}) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-yellow-600';
  const trendBg = trend === 'up' ? 'bg-green-50' : trend === 'down' ? 'bg-red-50' : 'bg-yellow-50';

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className="text-3xl font-light text-stone-800 mb-2">{value}</p>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${trendBg} ${trendColor}`}>
          <span className="mr-1">{trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}</span>
          {change}
        </div>
        <p className="text-sm text-stone-500 mt-2">{description}</p>
      </div>
    </Card>
  );
}

function QuickActionCard({
  title,
  description,
  action,
  onClick,
  color
}: {
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
      <div 
        className="p-4 flex items-center justify-between"
        onClick={onClick}
      >
        <div>
          <p className="font-medium text-stone-800">{title}</p>
          <p className="text-sm text-stone-600 mt-1">{description}</p>
        </div>
        <div className={`${color} text-white p-2 rounded-lg group-hover:scale-110 transition-transform duration-200 text-sm font-medium`}>
          {action}
        </div>
      </div>
    </Card>
  );
}