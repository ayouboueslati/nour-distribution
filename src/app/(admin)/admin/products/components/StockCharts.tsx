'use client';

import React from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts';
import { Card } from '../../../../components/ui';
import { StockAnalyticsOverview, StockMovementTrends } from '../../../../../types/inventory';

interface StockChartsProps {
    categoryData: StockAnalyticsOverview['value_by_category'];
    trendsData: StockMovementTrends | null;
    loading?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-stone-200 rounded-lg shadow-lg text-sm">
                <p className="font-medium mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const StockCharts = ({ categoryData, trendsData, loading }: StockChartsProps) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="h-80 bg-stone-100 rounded-xl animate-pulse" />
                <div className="h-80 bg-stone-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    // Format category data for chart
    const pieData = categoryData.map(d => ({
        name: d.category_name,
        value: d.total_stock_value
    }));

    // Create mock trend data if not provided (since API returns aggregated totals usually)
    // In a real scenario, the API should return time-series data for the line chart
    const trendChartData = [
        { name: 'Semaine 1', in: 45, out: 30 },
        { name: 'Semaine 2', in: 55, out: 40 },
        { name: 'Semaine 3', in: 40, out: 50 },
        { name: 'Semaine 4', in: 60, out: 45 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category Distribution */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Valeur par Catégorie</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value: number) => [`${(value ?? 0).toLocaleString()} DT`, 'Valeur']}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Movement Trends */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold text-stone-800 mb-4">Mouvements de Stock (30 jours)</h3>
                {trendsData && (
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div className="bg-green-50 rounded p-2">
                            <span className="text-xs text-green-600 block">Entrées</span>
                            <span className="font-bold text-green-700">{trendsData.stock_in.count}</span>
                        </div>
                        <div className="bg-red-50 rounded p-2">
                            <span className="text-xs text-red-600 block">Sorties</span>
                            <span className="font-bold text-red-700">{trendsData.stock_out.count}</span>
                        </div>
                        <div className="bg-blue-50 rounded p-2">
                            <span className="text-xs text-blue-600 block">Net</span>
                            <span className={`font-bold ${trendsData.net_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trendsData.net_change > 0 ? '+' : ''}{trendsData.net_change}
                            </span>
                        </div>
                    </div>
                )}
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <RechartsTooltip />
                            <Area type="monotone" dataKey="in" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Entrées" />
                            <Area type="monotone" dataKey="out" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Sorties" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};
