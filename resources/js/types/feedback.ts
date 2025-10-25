import type { PaginatedData } from './datatable';
import type { Booking } from './booking';

export interface Feedback {
    id: number;
    booking_id: number | null;
    guest_name: string;
    guest_email: string | null;
    guest_phone: string | null;
    guest_address: string | null;
    rating: number;
    comment: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    updated_at: string;
    booking?: Booking;
}

export interface FeedbackIndexData {
    feedbacks: PaginatedData<Feedback>;
}

export interface FeedbackFormData {
    booking_id?: string;
    guest_name: string;
    guest_email?: string;
    guest_phone?: string;
    guest_address?: string;
    rating: number;
    comment?: string;
    status: 'pending' | 'approved' | 'rejected';
}
