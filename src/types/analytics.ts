export interface DashboardAnalytics {
    total_revenue_this_month: number;
    revenue_vs_last_month_percent: number;
    total_orders: number;
    active_clients: number;
    low_stock_items: number;
    outstanding_payments: number;
    orders_breakdown: {
        pending: number;
        processing: number;
        completed: number;
        cancelled: number;
    };
    unpaid_factures_count: number;
}

export interface SalesAnalytics {
    sales_trend: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
    sales_by_client_type: {
        b2b: number;
        b2c: number;
    };
    top_products: Array<{
        id: string;
        name: string;
        revenue: number;
        quantity: number;
    }>;
    payment_efficiency: {
        avg_days_to_pay: number;
        collection_rate: number;
    };
    vat_analytics: {
        total_vatCollected: number;
    };
}

export interface StockAnalytics {
    stock_overview: {
        total_products: number;
        total_value: number;
        out_of_stock_count: number;
    };
    slow_moving_items: Array<{
        id: string;
        name: string;
        current_stock: number;
        last_30_days_sales: number;
    }>;
    stock_turnover_ratio: number;
}

export interface VisualizationData {
    // Plotly.js compatible JSON
    [key: string]: any;
}

export interface FinancialAnalytics {
    summary: {
        revenue: number;
        revenue_change_percent: number;
        expenses: number;
        expenses_change_percent: number;
        profit: number;
        profit_change_percent: number;
        margin: number;
        margin_change_percent: number;
    };
    trend: Array<{
        month: string;
        revenue: number;
        expenses: number;
        profit: number;
        margin: number;
    }>;
}

export interface ExpenseBreakdown {
    categories: Array<{
        category: string;
        amount: number;
        percentage: number;
        trend: 'up' | 'down' | 'stable';
    }>;
    sources: Array<{
        name: string;
        amount: number;
        source: string;
        accuracy: 'high' | 'medium' | 'low';
    }>;
}

export interface ComparisonData {
    month: string;
    thisYear: number;
    lastYear: number;
}

export interface InsightData {
    insights: string[];
}

export type ChargeCategory = 'rent' | 'utilities' | 'salaries' | 'marketing' | 'supplies' | 'maintenance' | 'other';

export interface Charge {
    id: string;
    date: string;
    category: ChargeCategory;
    description: string;
    amount: number;
    type: 'fixed' | 'variable';
    recurrence?: 'ponctuel' | 'weekly' | 'monthly' | 'yearly';
    supplier?: string;
    receipt_number?: string;
    notes?: string;
    validated: boolean;
    created_at: string;
    updated_at: string;
}

export interface ChargeInput {
    date: string;
    category: ChargeCategory;
    description: string;
    amount: number;
    type: 'fixed' | 'variable';
    recurrence?: 'ponctuel' | 'weekly' | 'monthly' | 'yearly';
    supplier?: string;
    receipt_number?: string;
    notes?: string;
    validated?: boolean;
}
