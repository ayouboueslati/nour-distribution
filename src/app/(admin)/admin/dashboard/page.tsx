'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/index';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { SkeletonStatCard, SkeletonChart, SkeletonOrderCard, SkeletonList } from '../../../components/ui/Skeletons';
import { apiService } from '../../../lib/api';
// import ProtectedRoute from '../../../components/ProtectedRoute';

// Obsolete mock data removed

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
  const [dashboardData, setDashboardData] = useState<any>({
    stats: {
      totalRevenue: 0,
      revenueVsLastMonth: 0,
      totalOrders: 0,
      activeClients: 0,
      lowStockItems: 0,
      outstandingPayments: 0,
      unpaidFacturesCount: 0,
      ordersBreakdown: {
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0
      }
    },
    recentOrders: [],
    lowStockProducts: [],
    salesAnalytics: null,
    stockAnalytics: null
  });

  // Load dashboard data from APIs
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch new analytics data and orders
      const [financials, dashboardInfo, ordersRes] = await Promise.all([
        apiService.getFinancialAnalytics(timeRange),
        apiService.getAnalyticsDashboard(), // For non-financial stats
        apiService.getOrders({ limit: 5 }).catch(() => ({ orders: [] }))
      ]);

      const stats = dashboardInfo;
      const orders = ordersRes.orders || [];

      // Get recent orders (last 5)
      const recentOrders = orders
        .map((order: any) => ({
          id: order.order_number,
          customer: order.client?.company_name || `${order.client?.first_name || ''} ${order.client?.last_name || ''}`.trim() || 'Client',
          amount: `${(order.total_amount || 0).toLocaleString()} DT`,
          status: order.status === 'en_attente' || order.status === 'pending' ? 'En attente' :
            order.status === 'confirme' || order.status === 'confirmed' ? 'Confirmée' :
              order.status === 'livre' || order.status === 'delivered' ? 'Livrée' : 'En traitement',
          date: order.submitted_at
        }));

      setDashboardData((prev: any) => ({
        ...prev,
        stats: {
          totalRevenue: financials.summary.revenue,
          revenueVsLastMonth: financials.summary.revenue_change_percent,
          totalOrders: stats.total_orders || 0,
          activeClients: stats.active_clients || 0,
          lowStockItems: stats.low_stock_items || 0,
          outstandingPayments: stats.outstanding_payments || 0,
          unpaidFacturesCount: stats.unpaid_factures_count || 0,
          ordersBreakdown: stats.orders_breakdown || { pending: 0, processing: 0, completed: 0, cancelled: 0 }
        },
        recentOrders,
        salesAnalytics: {
          sales_trend: financials.trend.map((t: any) => ({
            date: t.month,
            revenue: t.revenue,
            sales: t.revenue,
            orders: t.profit // Using profit as a fallback for the orders line if trend doesn't include it
          }))
        }
      }));

      // Load additional analytics in background
      loadDetailedAnalytics();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetailedAnalytics = async () => {
    try {
      const salesRes = await apiService.getAnalyticsSales(
        timeRange === 'week' ? 'weekly' : 'monthly'
      );
      const stockRes = await apiService.getAnalyticsStock();

      console.log('📊 Sales Analytics Response:', salesRes);
      console.log('📦 Stock Analytics Response:', stockRes);

      setDashboardData((prev: any) => ({
        ...prev,
        salesAnalytics: {
          ...prev.salesAnalytics,
          top_products: salesRes.top_products || []
        },
        stockAnalytics: stockRes,
        // Try multiple possible field names for low stock items
        lowStockProducts: (stockRes.low_stock_items || stockRes.slow_moving_items || stockRes.low_stock_alerts || []).map((item: any) => ({
          id: item.id || item.product_id,
          name: item.name || item.product_name,
          stock: item.current_stock ?? item.stock ?? 0,
          alert: (item.current_stock ?? item.stock ?? 0) === 0 ? 'danger' : 'warning'
        }))
      }));
    } catch (error) {
      console.error('Error loading detailed analytics:', error);
    }
  };

  // Get chart data based on time range
  const chartData = useMemo(() => {
    if (dashboardData.salesAnalytics?.sales_trend) {
      return dashboardData.salesAnalytics.sales_trend.map((item: any) => ({
        ...item,
        name: item.date,
        sales: item.revenue,
        revenue: item.revenue,
        orders: item.orders
      }));
    }
    return [];
  }, [dashboardData.salesAnalytics]);

  // Get X-axis data key
  const xAxisKey = 'name';

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
              name="Ventes (DT)"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#2563eb' }}
              name="Revenu Total (DT)"
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
              name="Ventes (DT)"
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
              name="Ventes (DT)"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenu Total (DT)"
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
              name="Ventes (DT)"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonStatCard key={`skeleton-stat-${i}`} />
          ))
        ) : (
          <>
            <StatCard
              title="Revenu du Mois"
              value={`${(dashboardData.stats.totalRevenue ?? 0).toLocaleString()} DT`}
              icon="💰"
              trend={`${(dashboardData.stats.revenueVsLastMonth ?? 0) >= 0 ? '+' : ''}${dashboardData.stats.revenueVsLastMonth ?? 0}% vs mois dernier`}
              link="/admin/sales/factures"
            />
            <StatCard
              title="Total Commandes"
              value={(dashboardData.stats.totalOrders ?? 0).toString()}
              icon="📦"
              trend="Cumul historique"
              link="/admin/orders"
            />
            <StatCard
              title="Clients Actifs"
              value={(dashboardData.stats.activeClients ?? 0).toString()}
              icon="👥"
              trend="Clients avec commandes"
              link="/admin/clients"
            />
            <StatCard
              title="Produits Alert Stock"
              value={(dashboardData.stats.lowStockItems ?? 0).toString()}
              icon="⚠️"
              trend={(dashboardData.stats.lowStockItems ?? 0) > 0 ? "Besoin réappro" : "Stock sain"}
              link="/admin/products"
            />
            <StatCard
              title="Paiements en Attente"
              value={`${(dashboardData.stats.outstandingPayments ?? 0).toLocaleString()} DT`}
              icon="💵"
              trend="Total à encaisser"
              link="/admin/sales/factures"
            />
            <StatCard
              title="Factures Impayées"
              value={(dashboardData.stats.unpaidFacturesCount ?? 0).toString()}
              icon="🧾"
              trend="Retards de paiement"
              link="/admin/sales/factures"
            />
          </>
        )}
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

          {isLoading ? (
            <SkeletonChart />
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-stone-600">Ventes Moyennes</p>
                  <p className="font-semibold text-stone-800">
                    {chartData.length > 0
                      ? (Math.round(chartData.reduce((sum: number, item: any) => sum + (item.sales || 0), 0) / chartData.length) ?? 0).toLocaleString()
                      : 0} DT
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-stone-600">Commandes Total</p>
                  <p className="font-semibold text-stone-800">
                    {chartData.reduce((sum: number, item: any) => sum + (item.orders || 0), 0)}
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-sm text-stone-600">Croissance</p>
                  <p className={`font-semibold ${(dashboardData.stats.revenueVsLastMonth ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(dashboardData.stats.revenueVsLastMonth ?? 0) >= 0 ? '+' : ''}{dashboardData.stats.revenueVsLastMonth ?? 0}%
                  </p>
                </div>
              </div>
            </>
          )}
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
                <span className="text-stone-600">Commandes en Attente</span>
                <span className="font-semibold text-amber-600">{dashboardData.stats.ordersBreakdown.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">En Cours de Traitement</span>
                <span className="font-semibold text-blue-600">{dashboardData.stats.ordersBreakdown.processing}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Commandes Complétées</span>
                <span className="font-semibold text-green-600">{dashboardData.stats.ordersBreakdown.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-600">Commandes Annulées</span>
                <span className="font-semibold text-red-600">{dashboardData.stats.ordersBreakdown.cancelled}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100 italic text-[10px] text-stone-400 text-right">
              Mise à jour à: {new Date().toLocaleTimeString('fr-FR')}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-800">Commandes Récentes</h2>
            <Link href="/admin/orders" className="text-amber-600 hover:text-amber-700">
              Tout →
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <SkeletonList items={5} />
            ) : dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
              dashboardData.recentOrders.map((order: any, index: number) => (
                <div key={order.id || `order-${index}`} className="flex justify-between items-center p-3 border border-stone-100 rounded-xl hover:bg-stone-50 transition-all duration-200">
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{order.id}</p>
                    <p className="text-stone-500 text-xs">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-800 text-sm">{order.amount}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${order.status === 'En attente' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-stone-400 text-sm italic">
                Aucune commande récente
              </div>
            )}
          </div>
        </Card>

        {/* Top Products */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-800">Top Produits</h2>
            <Link href="/admin/products" className="text-amber-600 hover:text-amber-700">
              Statistiques →
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <SkeletonList items={5} />
            ) : dashboardData.salesAnalytics?.top_products && dashboardData.salesAnalytics.top_products.length > 0 ? (
              dashboardData.salesAnalytics.top_products.slice(0, 5).map((product: any, index: number) => (
                <div key={product.id || `product-${index}`} className="flex justify-between items-center p-3 border border-stone-100 rounded-xl hover:bg-stone-50 transition-all duration-200">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold text-stone-800 text-sm truncate">{product.name}</p>
                    <p className="text-stone-500 text-xs">{product.quantity ?? 0} vendus</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600 text-sm">{(product.revenue ?? 0).toLocaleString()} DT</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-stone-400 text-sm italic">
                Aucune donnée de vente disponible
              </div>
            )}
          </div>
        </Card>

        {/* Low Stock / Slow Moving Alert */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-800">Alertes Stock</h2>
            <Link href="/admin/products" className="text-amber-600 hover:text-amber-700">
              Gérer →
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <SkeletonList items={5} />
            ) : dashboardData.lowStockProducts && dashboardData.lowStockProducts.length > 0 ? (
              dashboardData.lowStockProducts.slice(0, 5).map((product: any, index: number) => (
                <div key={product.id || `lowstock-${index}`} className="flex justify-between items-center p-3 border border-stone-100 rounded-xl hover:bg-stone-50 transition-all duration-200">
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{product.name}</p>
                    <p className="text-stone-500 text-xs">Stock: {product.stock} unités</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${product.alert === 'danger' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                    {product.alert === 'danger' ? 'Rupture' : 'Faible'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-stone-400 text-sm italic">
                Aucune alerte stock pour le moment
              </div>
            )}
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