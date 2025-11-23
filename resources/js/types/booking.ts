// resources/js/types/booking.ts
import type { PaginatedData } from './datatable';
import type { User } from './user';
import type { Accommodation } from './accommodation';
import type { AccommodationRate } from './accommodation-rate';
import type { PaymentAccount } from './payment-account';

// Define Payment and Refund here to avoid circular dependency
export interface Payment {
    id: number;
    booking_id: number;
    rebooking_id: number | null;
    payment_number: string;
    amount: string;
    payment_method: 'cash' | 'bank' | 'gcash' | 'maya' | 'other';
    is_down_payment: boolean;
    is_rebooking_payment: boolean;
    payment_account_id: number | null;
    reference_number: string | null;
    reference_image: string | null;
    reference_image_url: string | null;
    notes: string | null;
    payment_date: string;
    received_by: number;
    created_at: string;
    updated_at: string;

    // Relationships
    booking?: Booking;
    rebooking?: Rebooking;
    payment_account?: PaymentAccount;
    received_by_user?: User;
    refunds?: Refund[];

    // Computed properties
    refunded_amount?: string;
    remaining_amount?: string;
}

export interface Refund {
    id: number;
    payment_id: number;
    rebooking_id: number | null;
    refund_number: string;
    amount: string;
    refund_method: 'cash' | 'bank' | 'gcash' | 'maya' | 'original_method' | 'other';
    is_rebooking_refund: boolean;
    refund_account_id: number | null;
    reference_number: string | null;
    reference_image: string | null;
    reference_image_url: string | null;
    reason: string | null;
    notes: string | null;
    refund_date: string;
    processed_by: number;
    created_at: string;
    updated_at: string;

    // Relationships
    payment?: Payment;
    rebooking?: Rebooking;
    refund_account?: PaymentAccount;
    processed_by_user?: User;
}

export interface Rebooking {
    id: number;
    rebooking_number: string;
    original_booking_id: number;
    processed_by: number;
    new_check_in_date: string;
    new_check_out_date: string | null;
    new_total_adults: number;
    new_total_children: number;
    new_total_guests: number;
    original_amount: string;
    new_amount: string;
    amount_difference: string;
    rebooking_fee: string;
    total_adjustment: string;
    status: 'pending' | 'approved' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded';
    reason: string | null;
    remarks: string | null;
    approved_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;

    // Computed properties
    total_paid?: string;
    total_refunded?: string;
    remaining_payment?: string;
    remaining_refund?: string;

    // Relationships
    original_booking?: Booking;
    processed_by_user?: User;
    accommodations?: RebookingAccommodation[];
    entrance_fees?: RebookingEntranceFee[];
    payments?: Payment[];
    refunds?: Refund[];
}

export interface RebookingAccommodation {
    id: number;
    rebooking_id: number;
    accommodation_id: number;
    accommodation_rate_id: number;
    guests: number;
    rate: string;
    additional_pax_charge: string;
    subtotal: string;
    free_entrance_used: number;
    created_at: string;
    updated_at: string;

    // Relationships
    accommodation?: Accommodation;
    accommodation_rate?: AccommodationRate;
}

export interface RebookingEntranceFee {
    id: number;
    rebooking_id: number;
    type: 'adult' | 'child';
    quantity: number;
    rate: string;
    subtotal: string;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    id: number;
    booking_number: string;
    booking_code: string;
    booking_type: 'day_tour' | 'overnight';
    source: 'guest' | 'registered' | 'walkin';
    guest_name: string;
    guest_email: string | null;
    guest_phone: string | null;
    guest_address: string | null;
    check_in_date: string;
    check_out_date: string | null;
    total_adults: number;
    total_children: number;
    check_in_time: string | null;
    check_in_remarks: string | null;
    check_out_time: string | null;
    check_out_remarks: string | null;
    total_guests: number;
    accommodation_total: string;
    entrance_fee_total: string;
    total_amount: string;
    paid_amount: string;
    balance: string;
    down_payment_required: boolean;
    down_payment_amount: string | null;
    down_payment_paid: string;
    down_payment_balance: string;
    is_fully_paid: boolean;
    status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
    notes: string | null;
    created_by: number;
    created_at: string;
    updated_at: string;

    // Relationships
    created_by_user?: User;
    accommodations?: BookingAccommodation[];
    entrance_fees?: BookingEntranceFee[];
    payments?: Payment[];
    rebookings?: Rebooking[];
}

export interface BookingAccommodation {
    id: number;
    booking_id: number;
    accommodation_id: number;
    accommodation_rate_id: number;
    guests: number;
    rate: string;
    additional_pax_charge: string;
    subtotal: string;
    free_entrance_used: number;
    created_at: string;
    updated_at: string;

    // Relationships
    accommodation?: Accommodation;
    accommodation_rate?: AccommodationRate;
}

export interface BookingEntranceFee {
    id: number;
    booking_id: number;
    type: 'adult' | 'child';
    quantity: number;
    rate: string;
    subtotal: string;
    created_at: string;
    updated_at: string;
}

export interface BookingIndexData {
    bookings: PaginatedData<Booking>;
    stats?: {
        total_bookings: number;
        pending_bookings: number;
        confirmed_bookings: number;
        total_revenue: string;
    };
}

export interface BookingFormData {
    source: 'guest' | 'registered' | 'walkin';
    booking_type: 'day_tour' | 'overnight';
    created_by?: number;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    guest_address: string;
    check_in_date: string;
    check_out_date: string;
    total_adults: number | string;
    total_children: number | string;
    down_payment_required: boolean;
    down_payment_amount: string;
    notes: string;
    accommodations: {
        accommodation_id: number | string;
        accommodation_rate_id: number | string;
        guests: number | string;
    }[];
}

export interface RebookingIndexData {
    rebookings: PaginatedData<Rebooking>;
    stats?: {
        total_rebookings: number;
        pending_rebookings: number;
        approved_rebookings: number;
        completed_rebookings: number;
    };
}

export interface RebookingFormData {
    original_booking_id: number;
    new_check_in_date: string;
    new_check_out_date?: string;
    new_total_adults: number;
    new_total_children: number;
    reason?: string;
    accommodations: {
        accommodation_id: number;
        accommodation_rate_id: number;
        guests: number;
    }[];
}
