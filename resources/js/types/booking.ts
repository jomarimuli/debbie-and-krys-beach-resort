// resources/js/types/booking.ts

import type { User } from './user';
import type { Room } from './room';
import type { Cottage } from './cottage';
import type { EntranceFee } from './entrance-fee';

export type BookingType = 'registered' | 'guest' | 'walk_in';

export type RentalType = 'overnight' | 'day_tour';

export type BookingStatus =
    | 'pending'
    | 'confirmed'
    | 'checked_in'
    | 'checked_out'
    | 'cancelled';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export type BookableType = 'room' | 'cottage';

export interface Booking {
    id: number;
    booking_number: string;
    booking_type: BookingType;
    user_id?: number;
    user?: User;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    guest_address?: string;
    check_in_date: string;
    check_out_date?: string;
    rental_type: RentalType;
    total_pax: number;
    subtotal: string;
    entrance_fee_total: string;
    total_amount: string;
    paid_amount: string;
    balance: string;
    status: BookingStatus;
    payment_status: PaymentStatus;
    created_by?: number;
    created_by_user?: User;
    notes?: string;
    cancellation_reason?: string;
    cancelled_at?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    booking_items?: BookingItem[];
    entrance_fee_details?: EntranceFeeDetail[];
}

export interface BookingItem {
    id: number;
    booking_id: number;
    booking?: Booking;
    bookable_type: string;
    bookable_id: number;
    bookable?: Room | Cottage;
    item_name: string;
    item_type: BookableType;
    rental_type: RentalType;
    quantity: number;
    pax: number;
    unit_price: string;
    total_price: string;
    free_entrance_count: number;
    free_cottage_size?: string;
    extra_pax: number;
    excess_pax_fee: string;
    created_at: string;
    updated_at: string;
}

export interface EntranceFeeDetail {
    id: number;
    booking_id: number;
    booking?: Booking;
    entrance_fee_id?: number;
    entrance_fee?: EntranceFee;
    fee_name: string;
    rental_type: RentalType;
    age_min?: number;
    age_max?: number;
    pax_count: number;
    rate: string;
    total: string;
    free_count: number;
    paid_count: number;
    created_at: string;
    updated_at: string;
}

export interface BookingFormData {
    booking_type?: BookingType;
    user_id?: number;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    guest_address?: string;
    check_in_date: string;
    check_out_date?: string;
    rental_type: RentalType;
    total_pax: number;
    notes?: string;
    items: BookingItemFormData[];
    entrance_fees: EntranceFeeFormData[];
}

export interface BookingItemFormData {
    bookable_type: string;
    bookable_id: number;
    item_name: string;
    item_type: BookableType;
    rental_type: RentalType;
    quantity: number;
    pax: number;
    unit_price: number;
}

export interface EntranceFeeFormData {
    entrance_fee_id?: number | null;
    fee_name: string;
    rental_type: RentalType;
    age_min?: number | null;
    age_max?: number | null;
    pax_count: number;
    rate: number;
    free_count?: number;
}

export interface BookingIndexData {
    bookings: {
        data: Booking[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface BookingShowData {
    booking: Booking;
}
