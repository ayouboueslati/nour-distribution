import React from 'react';
import { Card } from '../../../../components/ui';
import { StockAnalyticsOverview } from '../../../../../types/inventory';

interface StockKPICardsProps {
    data: StockAnalyticsOverview['overview'];
    loading?: boolean;
}

export const StockKPICards = ({ data, loading }: StockKPICardsProps) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-stone-100 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    const kpis = [
        {
            title: 'Valeur du Stock',
            value: `${(data.total_stock_value ?? 0).toLocaleString()} DT`,
            subtitle: `${data.total_products ?? 0} produits`,
            icon: '💰',
            bgClass: 'bg-emerald-50 border-emerald-100',
            textClass: 'text-emerald-700'
        },
        {
            title: 'Santé du Stock',
            value: `${data.stock_health_percentage ?? 0}%`,
            subtitle: 'Produits disponibles',
            icon: '❤️',
            bgClass: 'bg-blue-50 border-blue-100',
            textClass: 'text-blue-700'
        },
        {
            title: 'Stock Faible',
            value: data.low_stock_count ?? 0,
            subtitle: 'Nécessite réappro.',
            icon: '⚠️',
            bgClass: 'bg-amber-50 border-amber-100',
            textClass: 'text-amber-700'
        },
        {
            title: 'Rupture',
            value: data.out_of_stock_count ?? 0,
            subtitle: 'Disponibilité critique',
            icon: '❌',
            bgClass: 'bg-red-50 border-red-100',
            textClass: 'text-red-700'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi, index) => (
                <div
                    key={index}
                    className={`p-4 rounded-xl border ${kpi.bgClass} transition-all duration-200 hover:shadow-sm`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-2xl">{kpi.icon}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/50 ${kpi.textClass}`}>
                            {kpi.title}
                        </span>
                    </div>
                    <div className="mt-2">
                        <h3 className="text-2xl font-bold text-stone-800">{kpi.value}</h3>
                        <p className="text-xs text-stone-500 mt-1">{kpi.subtitle}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
