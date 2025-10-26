import type { PaginatedData } from './datatable';
import type { User } from './user';
import type { Booking } from './booking';

export interface Payment {
    id: number;
    booking_id: number;
    payment_number: string;
    amount: string;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'gcash' | 'other';
    reference_number: string | null;
    reference_image: string | null;
    reference_image_url: string | null;
    notes: string | null;
    payment_date: string;
    created_at: string;
    updated_at: string;
    booking?: Booking;
    received_by?: User;
}

export interface PaymentIndexData {
    payments: PaginatedData<Payment>;
}

export interface PaymentFormData {
    booking_id: string;
    amount: string;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'gcash' | 'other';
    reference_number?: string;
    reference_image?: File | null;
    remove_reference_image?: boolean;
    notes?: string;
    payment_date: string;
}
