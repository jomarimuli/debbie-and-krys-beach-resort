// resources/js/types/payment.ts
import type { User } from './user';
import type { Booking } from './booking';

export interface Payment {
    id: number;
    booking_id: number;
    payment_number: string;
    amount: string;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'gcash' | 'other';
    reference_number: string | null;
    notes: string | null;
    received_by: number | null;
    payment_date: string;
    created_at: string;
    updated_at: string;
    booking?: Booking;
    received_by_user?: User;
}

export interface PaymentFormData {
    booking_id: number;
    amount: number;
    payment_method: 'cash' | 'card' | 'bank_transfer' | 'gcash' | 'other';
    reference_number?: string;
    notes?: string;
    payment_date: string;
}
