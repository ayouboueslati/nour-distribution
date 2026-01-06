import { BaseEntity, OrderStatus } from './index';

export type DeliveryStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED';

export interface DeliveryItem {
    product_id: string;
    quantity: number;
    product_name: string;
    sku: string;
}

export interface DeliveryNote extends BaseEntity {
    order_id: string;
    status: DeliveryStatus;
    items: DeliveryItem[];
    tracking_number?: string;
    shipped_at?: string;
    delivered_at?: string;
    notes?: string;
    carrier?: string;

    // Computed or joined fields
    delivery_number?: string;
    client_name?: string;
}

export interface CreateDeliveryPayload {
    order_id: string;
    items: {
        product_id: string;
        quantity: number;
    }[];
    notes?: string;
}

export interface DeliveryListResponse {
    deliveries: DeliveryNote[];
    total: number;
    page: number;
    page_size: number;
}
