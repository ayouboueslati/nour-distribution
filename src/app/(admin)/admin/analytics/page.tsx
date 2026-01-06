'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, Button, Badge } from "../../../components/ui/index";
import Link from 'next/link';
import {
  PerformanceChart,
  RevenueExpenseBarChart,
  ExpensePieChart,
  ProfitMarginChart,
  MonthlyComparisonChart
} from './components/charts/FinancialCharts';
import { apiService } from '@/app/lib/api';
import { FinancialAnalytics, ExpenseBreakdown, ComparisonData, InsightData } from '@/types/analytics';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [chartView, setChartView] = useState<'performance' | 'revenue' | 'profit' | 'comparison'>('performance');
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState<FinancialAnalytics | null>(null);
  const [expenses, setExpenses] = useState<ExpenseBreakdown | null>(null);
  const [comparisons, setComparisons] = useState<ComparisonData[] | null>(null);
  const [insights, setInsights] = useState<InsightData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [financialsRes, expensesRes, comparisonsRes, insightsRes] = await Promise.all([
        apiService.getFinancialAnalytics(timeRange),
        apiService.getExpenseBreakdown(),
        apiService.getComparisonData(),
        apiService.getSmartInsights()
      ]);

      setFinancials(financialsRes);
      setExpenses(expensesRes);
      setComparisons(comparisonsRes);
      setInsights(insightsRes);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString() || 0} DT`;
  };

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

  const renderMainChart = () => {
    if (loading) return <div className="h-full flex items-center justify-center">Chargement des données...</div>;
    if (!financials) return <div className="h-full flex items-center justify-center">Données non disponibles</div>;

    switch (chartView) {
      case 'performance':
        return <PerformanceChart data={financials.trend} />;
      case 'revenue':
        return <RevenueExpenseBarChart data={financials.trend} />;
      case 'profit':
        return <ProfitMarginChart data={financials.trend} />;
      case 'comparison':
        return comparisons ? <MonthlyComparisonChart data={comparisons} /> : null;
      default:
        return <PerformanceChart data={financials.trend} />;
    }
  };

  if (loading && !financials) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-64 bg-stone-200 animate-pulse rounded" />
          <div className="h-10 w-48 bg-stone-200 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-stone-100 animate-pulse rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 h-96 bg-stone-100 animate-pulse rounded-xl" />
          <div className="h-96 bg-stone-100 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const summary = financials?.summary || {
    revenue: 0, revenue_change_percent: 0,
    expenses: 0, expenses_change_percent: 0,
    profit: 0, profit_change_percent: 0,
    margin: 0, margin_change_percent: 0
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
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${timeRange === range
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
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setChartView(key)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${chartView === key
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
          value={formatCurrency(summary.revenue)}
          change={`${summary.revenue_change_percent >= 0 ? '+' : ''}${summary.revenue_change_percent}%`}
          trend={summary.revenue_change_percent >= 0 ? 'up' : 'down'}
          icon="💰"
          description="Revenus totaux ce mois"
        />
        <MetricCard
          title="Charges Totales"
          value={formatCurrency(summary.expenses)}
          change={`${summary.expenses_change_percent >= 0 ? '+' : ''}${summary.expenses_change_percent}%`}
          trend={summary.expenses_change_percent >= 0 ? 'up' : 'down'}
          icon="💸"
          description="Dépenses globales (fournisseurs + fixes)"
        />
        <MetricCard
          title="Bénéfice Net"
          value={formatCurrency(summary.profit)}
          change={`${summary.profit_change_percent >= 0 ? '+' : ''}${summary.profit_change_percent}%`}
          trend={summary.profit_change_percent >= 0 ? 'up' : 'down'}
          icon="🎯"
          description="Profit net après charges"
        />
        <MetricCard
          title="Marge Bénéficiaire"
          value={`${summary.margin}%`}
          change={`${summary.margin_change_percent >= 0 ? '+' : ''}${summary.margin_change_percent}%`}
          trend={summary.margin_change_percent >= 0 ? 'up' : 'down'}
          icon="📈"
          description="Ratio profit/revenus global"
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
                <ExpensePieChart data={expenses?.categories.map(c => ({ name: c.category, value: c.amount })) || []} />
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
                {expenses?.sources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <div>
                      <p className="font-medium text-stone-800">{source.name}</p>
                      <p className="text-sm text-stone-500 capitalize">
                        Catégorie: {source.source}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(source.amount)}</p>
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
            {expenses?.categories.map((category, index) => (
              <div key={category.category} className="text-center p-4 bg-stone-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-red-500' :
                    index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-green-500' :
                        index === 3 ? 'bg-yellow-500' : 'bg-purple-500'
                    }`} />
                </div>
                <p className="font-medium text-stone-800 text-sm mb-1">{category.category}</p>
                <p className="text-lg font-semibold text-stone-800">{formatCurrency(category.amount)}</p>
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
            💡 Business Health & Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights?.insights.map((insight, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm leading-relaxed font-medium">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="📋 Rapport Détaillé"
          description="Générer un rapport financier complet"
          action="Générer"
          onClick={() => console.log('Generate report')}
          color="bg-stone-800"
        />
        <QuickActionCard
          title="🔍 Analyse des Charges"
          description="Gérer les dépenses opérationnelles"
          action="Gérer"
          onClick={() => window.location.href = '/admin/analytics/charges'}
          color="bg-amber-500"
        />
        <QuickActionCard
          title="🎯 Objectifs Annuels"
          description="Définir et suivre les budgets"
          action="Configurer"
          onClick={() => console.log('Set goals')}
          color="bg-blue-600"
        />
      </div>
    </div>
  );
}

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
    <div onClick={onClick} className="cursor-pointer group">
      <Card className="hover:shadow-md transition-all duration-200">
        <div
          className="p-4 flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-stone-800">{title}</p>
            <p className="text-sm text-stone-600 mt-1">{description}</p>
          </div>
          <div className={`${color} text-white px-3 py-1.5 rounded-lg group-hover:scale-105 transition-transform duration-200 text-sm font-medium shadow-sm`}>
            {action}
          </div>
        </div>
      </Card>
    </div>
  );
}
