'use client';

import React, { useState, useEffect } from 'react';
import { Button, Select } from '../../../../components/ui';
import { apiService } from '../../../../lib/api';
import { StockKPICards } from './StockKPICards';
import { StockCharts } from './StockCharts';
import { TurnoverTable } from './TurnoverTable';
import { StockAnalyticsOverview, StockMovementTrends, TurnoverAnalysis } from '../../../../../types/inventory';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export const StockAnalyticsSection = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');
    const [overview, setOverview] = useState<StockAnalyticsOverview | null>(null);
    const [trends, setTrends] = useState<StockMovementTrends | null>(null);
    const [turnover, setTurnover] = useState<TurnoverAnalysis | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const days = parseInt(period);

            const [overviewData, trendsData, turnoverData] = await Promise.all([
                apiService.getStockAnalyticsOverview(),
                apiService.getStockMovementTrends({ days }),
                apiService.getStockTurnoverAnalysis({ days, limit: 5 })
            ]);

            setOverview(overviewData);
            setTrends(trendsData);
            setTurnover(turnoverData);
        } catch (error) {
            console.error('Error fetching stock analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, period]);

    if (!isOpen) {
        return (
            <div className="bg-white border border-stone-200 rounded-xl p-4 mb-6 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3">
                    <span className="text-xl">📊</span>
                    <div>
                        <h3 className="font-semibold text-stone-800">Analyses de Stock</h3>
                        <p className="text-sm text-stone-500">Cliquez pour voir les détails</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
                    <ChevronDown className="w-5 h-5 mr-1" />
                    Déplier
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 mb-8 animate-fade-in shadow-inner">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <h2 className="text-xl font-semibold text-stone-800">Analyses de Stock</h2>
                </div>

                <div className="flex items-center space-x-3">
                    <Select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        options={[
                            { value: '7', label: '7 derniers jours' },
                            { value: '30', label: '30 derniers jours' },
                            { value: '90', label: '90 derniers jours' }
                        ]}
                        className="w-48 bg-white"
                    />
                    <Button variant="secondary" size="sm" onClick={fetchData} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualiser
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                        <ChevronUp className="w-5 h-5 mr-1" />
                        Replier
                    </Button>
                </div>
            </div>

            {overview && (
                <StockKPICards
                    data={overview.overview}
                    loading={loading}
                />
            )}

            {overview && (
                <StockCharts
                    categoryData={overview.value_by_category}
                    trendsData={trends}
                    loading={loading}
                />
            )}

            {turnover && (
                <TurnoverTable
                    data={turnover.fast_moving_products}
                    loading={loading}
                />
            )}
        </div>
    );
};
