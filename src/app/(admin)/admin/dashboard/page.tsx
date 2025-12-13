'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/index';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { SkeletonStatCard, SkeletonChart, SkeletonOrderCard, SkeletonList } from '../../../components/ui/Skeletons';
// import ProtectedRoute from '../../../components/ProtectedRoute';


// Mock data - replace with API calls
const dashboardData = {
  stats: {
    totalRevenue: '45,230€',
    pendingOrders: 12,
    lowStock: 5,
    newCustomers: 8,
    unpaidInvoices: 3,
    pendingQuotes: 7
  },
  recentOrders: [
    { id: 'CMD-001', customer: 'Sarah Beauty', amount: '1,200€', status: 'En attente', date: '2025-01-15' },
    { id: 'CMD-002', customer: 'Institut Afro', amount: '850€', status: 'Traitée', date: '2025-01-14' },
    { id: 'CMD-003', customer: 'Coiffure Naturelle', amount: '2,150€', status: 'En attente', date: '2025-01-14' }
  ],
  lowStockProducts: [
    { id: 'PROD-001', name: 'Cheveux Brésilien 24"', stock: 3, alert: 'danger' },
    { id: 'PROD-002', name: 'Mèches Malaisie 26"', stock: 5, alert: 'warning' },
    { id: 'PROD-003', name: 'Perruque Lace Front', stock: 2, alert: 'danger' }
  ]
};

// Chart data for different time ranges
const weeklyData = [
  { day: 'Lun', sales: 4200, orders: 8, revenue: 5200 },
  { day: 'Mar', sales: 5800, orders: 12, revenue: 7200 },
  { day: 'Mer', sales: 3500, orders: 6, revenue: 4500 },
  { day: 'Jeu', sales: 6200, orders: 14, revenue: 7800 },
  { day: 'Ven', sales: 4800, orders: 10, revenue: 5900 },
  { day: 'Sam', sales: 7100, orders: 16, revenue: 8800 },
  { day: 'Dim', sales: 3900, orders: 7, revenue: 4800 }
];

const monthlyData = [
  { week: 'Sem 1', sales: 18500, orders: 32, revenue: 22800 },
  { week: 'Sem 2', sales: 22100, orders: 41, revenue: 27400 },
  { week: 'Sem 3', sales: 19800, orders: 36, revenue: 24500 },
  { week: 'Sem 4', sales: 24200, orders: 45, revenue: 29800 }
];

const yearlyData = [
  { month: 'Jan', sales: 85200, orders: 154, revenue: 105200 },
  { month: 'Fév', sales: 78900, orders: 142, revenue: 97400 },
  { month: 'Mar', sales: 92300, orders: 168, revenue: 114100 },
  { month: 'Avr', sales: 87400, orders: 159, revenue: 108000 },
  { month: 'Mai', sales: 96800, orders: 175, revenue: 119500 },
  { month: 'Juin', sales: 89200, orders: 162, revenue: 110200 },
  { month: 'Juil', sales: 81500, orders: 148, revenue: 100700 },
  { month: 'Aoû', sales: 76300, orders: 138, revenue: 94200 },
  { month: 'Sep', sales: 83400, orders: 151, revenue: 103000 },
  { month: 'Oct', sales: 90100, orders: 163, revenue: 111300 },
  { month: 'Nov', sales: 87600, orders: 158, revenue: 108200 },
  { month: 'Déc', sales: 94500, orders: 171, revenue: 116700 }
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-stone-200 rounded-lg shadow-lg">
        <p className="font-semibold text-stone-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useState(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  });

  // Get chart data based on time range
  const chartData = useMemo(() => {
    switch (timeRange) {
      case 'week': return weeklyData;
      case 'month': return monthlyData;
      case 'year': return yearlyData;
      default: return monthlyData;
    }
  }, [timeRange]);

  // Get X-axis data key based on time range
  const xAxisKey = useMemo(() => {
    switch (timeRange) {
      case 'week': return 'day';
      case 'month': return 'week';
      case 'year': return 'month';
      default: return 'week';
    }
  }, [timeRange]);

  // Render the appropriate chart based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#059669' }}
              name="Ventes (€)"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#2563eb' }}
              name="Revenu Total (€)"
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="sales"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="Ventes (€)"
            />
            <Bar
              dataKey="orders"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              name="Commandes"
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorSales)"
              name="Ventes (€)"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenu Total (€)"
            />
          </AreaChart>
        );

      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#059669' }}
              name="Ventes (€)"
            />
          </LineChart>
        );
    }
  };

  return (
    // <ProtectedRoute requiredRole={['super_admin', 'admin', 'manager', 'staff']}>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-light text-stone-800">Tableau de Bord</h1>
        <select
          className="border border-stone-300 rounded-xl px-4 py-2"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
        >
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Chiffre d'affaires"
          value={dashboardData.stats.totalRevenue}
          icon="💰"
          trend="+12%"
          link="/admin/sales/factures"
        />
        <StatCard
          title="Commandes en attente"
          value={dashboardData.stats.pendingOrders.toString()}
          icon="📦"
          trend="+3"
          link="/admin/orders"
        />
        <StatCard
          title="Produits en rupture"
          value={dashboardData.stats.lowStock.toString()}
          icon="⚠️"
          trend="Urgent"
          link="/admin/products"
        />
        <StatCard
          title="Devis en attente"
          value={dashboardData.stats.pendingQuotes.toString()}
          icon="📄"
          trend="+2"
          link="/admin/sales/devis"
        />
      </div>

      {/* Charts & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-800">
              Performance des Ventes {timeRange === 'week' ? 'Hebdomadaire' : timeRange === 'month' ? 'Mensuelle' : 'Annuelle'}
            </h2>
            <div className="flex space-x-2">
              {(['line', 'bar', 'area'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${chartType === type
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                >
                  {type === 'line' && 'Ligne'}
                  {type === 'bar' && 'Barres'}
                  {type === 'area' && 'Aire'}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-stone-600">Ventes Moyennes</p>
              <p className="font-semibold text-stone-800">
                {Math.round(chartData.reduce((sum, item) => sum + item.sales, 0) / chartData.length).toLocaleString()}€
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-stone-600">Commandes Total</p>
              <p className="font-semibold text-stone-800">
                {chartData.reduce((sum, item) => sum + (item.orders || 0), 0)}
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm text-stone-600">Croissance</p>
              <p className="font-semibold text-green-600">+12.5%</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">Actions Rapides</h2>
          <div className="space-y-3">
            <Link href="/admin/orders" className="block w-full bg-amber-500 text-white text-center py-3 rounded-xl hover:bg-amber-600 transition-all duration-200">
              📋 Voir les Commandes
            </Link>
            <Link href="/admin/products" className="block w-full bg-stone-200 text-stone-800 text-center py-3 rounded-xl hover:bg-stone-300 transition-all duration-200">
              📦 Gérer les Produits
            </Link>
            <Link href="/admin/sales/devis/new" className="block w-full bg-stone-200 text-stone-800 text-center py-3 rounded-xl hover:bg-stone-300 transition-all duration-200">
              📄 Créer un Devis
            </Link>
            <Link href="/admin/sales/factures/new" className="block w-full bg-stone-200 text-stone-800 text-center py-3 rounded-xl hover:bg-stone-300 transition-all duration-200">
              🧾 Créer une Facture
            </Link>
          </div>

          {/* Mini Stats */}
          <div className="mt-6 pt-6 border-t border-stone-200">
            <h3 className="text-lg font-semibold text-stone-800 mb-3">Aperçu du Jour</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Nouvelles Commandes</span>
                <span className="font-semibold text-stone-800">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Devis à Traiter</span>
                <span className="font-semibold text-amber-600">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Ventes Aujourd'hui</span>
                <span className="font-semibold text-stone-800">1,240€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-800">Commandes Récentes</h2>
            <Link href="/admin/orders" className="text-amber-600 hover:text-amber-700">
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recentOrders.map((order) => (
              <div key={order.id} className="flex justify-between items-center p-4 border border-stone-200 rounded-xl hover:shadow-sm transition-all duration-200">
                <div>
                  <p className="font-semibold text-stone-800">{order.id}</p>
                  <p className="text-stone-600 text-sm">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-stone-800">{order.amount}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${order.status === 'En attente' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-800">Alertes Stock</h2>
            <Link href="/admin/products" className="text-amber-600 hover:text-amber-700">
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.lowStockProducts.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-4 border border-stone-200 rounded-xl hover:shadow-sm transition-all duration-200">
                <div>
                  <p className="font-semibold text-stone-800">{product.name}</p>
                  <p className="text-stone-600 text-sm">Stock: {product.stock} unités</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${product.alert === 'danger' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                  {product.alert === 'danger' ? 'Rupture imminente' : 'Stock faible'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
    // </ProtectedRoute>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  link
}: {
  title: string;
  value: string;
  icon: string;
  trend: string;
  link: string;
}) {
  return (
    <Link href={link}>
      <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-stone-600 text-sm">{title}</p>
            <p className="text-2xl font-semibold text-stone-800 mt-2">{value}</p>
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
        <p className={`text-sm mt-3 ${trend.includes('+') ? 'text-green-600' : trend === 'Urgent' ? 'text-red-600' : 'text-stone-600'
          }`}>
          {trend}
        </p>
      </Card>
    </Link>
  );
}