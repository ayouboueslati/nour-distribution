// Devis tracking specific types

export interface DevisListItem {
    id: string;
    devis_number: string;
    document_number: string;
    version: number;
    status: string;
    total_amount: number;
    subtotal: number;
    tax_amount: number;
    issue_date: string;
    created_at: string;
    updated_at: string | null;
    client_id: string;
    order_id: string | null;
    notes: string | null;
    valid_until: string | null;
    payment_terms: string | null;
    payment_deadline: string | null;
}

export interface DevisListResponse {
    devis_list: DevisListItem[];
    total: number;
    page: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
}

// Timeline event types
export type TimelineEventType =
    | 'created'
    | 'version_created'
    | 'accepted'
    | 'converted_to_facture'
    | 'cancelled';

export interface TimelineEvent {
    event_type: TimelineEventType;
    devis_id: string;
    devis_number: string;
    version: number;
    timestamp: string;
    changed_by: string | null;
    changed_by_name: string | null;
    description: string;
    total_amount: number;
    status: string;
    action_details: {
        old_value: string | null;
        new_value: string | null;
    };
}

export interface DevisTimelineResponse {
    order_id: string;
    total_events: number;
    events: TimelineEvent[];
}

// Enhanced order type with devis info
export interface OrderWithDevisInfo {
    devis_count?: number;
    latest_devis?: DevisListItem | null;
}
