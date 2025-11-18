// resources/js/types/payment.ts
import type { PaginatedData } from './datatable';

// Re-export Payment and Refund from booking.ts to avoid circular dependency
export type { Payment, Refund } from './booking';

export interface PaymentIndexData {
    payments: PaginatedData<import('./booking').Payment>;
}

export interface PaymentFormData {
    booking_id: string;
    rebooking_id?: string;
    amount: string;
    payment_account_id?: string;
    is_down_payment?: boolean;
    is_rebooking_payment?: boolean;
    reference_number?: string;
    reference_image?: File | null;
    remove_reference_image?: boolean;
    notes?: string;
    payment_date: string;
}

export interface RefundIndexData {
    refunds: PaginatedData<import('./booking').Refund>;
}

export interface RefundFormData {
    payment_id: string;
    rebooking_id?: string;
    amount: string;
    refund_method: 'cash' | 'bank' | 'gcash' | 'maya' | 'original_method' | 'other';
    is_rebooking_refund?: boolean;
    refund_account_id?: string;
    reference_number?: string;
    reference_image?: File | null;
    remove_reference_image?: boolean;
    reason?: string;
    notes?: string;
    refund_date: string;
}
