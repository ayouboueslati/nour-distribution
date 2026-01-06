export interface StockAnalyticsOverview {
    overview: {
        total_products: number;
        total_stock_value: number;
        total_stock_quantity: number;
        total_reserved: number;
        total_available: number;
        low_stock_count: number;
        out_of_stock_count: number;
        stock_health_percentage: number;
    };
    value_by_category: Array<{
        category_id: string;
        category_name: string;
        product_count: number;
        total_stock_value: number;
        total_quantity: number;
    }>;
}

export interface StockMovementTrends {
    period_days: number;
    total_movements: number;
    stock_in: { count: number; total_quantity: number };
    stock_out: { count: number; total_quantity: number };
    reserved: { count: number; total_quantity: number };
    released: { count: number; total_quantity: number };
    net_change: number;
}

export interface ProductTurnover {
    product_id: string;
    product_name: string;
    sku: string;
    current_stock: number;
    units_sold: number;
    turnover_rate: number;
    movement_speed: 'fast' | 'medium' | 'slow';
    days_to_stockout: number | null;
}

export interface TurnoverAnalysis {
    turnover_data: ProductTurnover[];
    fast_moving_products: ProductTurnover[];
    slow_moving_products: ProductTurnover[];
    analysis_period_days: number;
}

export interface AgingReport {
    aging_data: Array<{
        product_id: string;
        product_name: string;
        sku: string;
        current_stock: number;
        stock_value: number;
        days_since_last_movement: number;
        last_movement_date: string;
        aging_category: 'fresh' | 'stable' | 'old' | 'very_old';
    }>;
    total_products: number;
}
