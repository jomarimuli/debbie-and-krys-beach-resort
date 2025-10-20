// resources/js/types/booking.ts
import type { PaginatedData } from './datatable';
import type { User } from './user';
import type { Accommodation } from './accommodation';
import type { Payment } from './payment';

export interface Booking {
    id: number;
    booking_number: string;
    source: 'guest' | 'registered' | 'walkin';
    booking_type: 'day_tour' | 'overnight';
    user_id: number | null;
    guest_name: string;
    guest_email: string | null;
    guest_phone: string | null;
    guest_address: string | null;
    check_in_date: string;
    check_out_date: string | null;
    total_adults: number;
    total_children: number;
    accommodation_total: string;
    entrance_fee_total: string;
    total_amount: string;
    paid_amount: string;
    balance: string;
    is_fully_paid: boolean;
    total_guests: number;
    status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
    notes: string | null;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    user?: User;
    created_by_user?: User;
    accommodations?: BookingAccommodation[];
    entrance_fees?: BookingEntranceFee[];
    payments?: Payment[];
}

export interface BookingAccommodation {
    id: number;
    booking_id: number;
    accommodation_id: number;
    quantity: number;
    guests: number;
    rate: string;
    additional_pax_charge: string;
    subtotal: string;
    free_entrance_used: number;
    created_at: string;
    updated_at: string;
    accommodation?: Accommodation;
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
    user_id?: number;
    guest_name: string;
    guest_email?: string;
    guest_phone?: string;
    guest_address?: string;
    check_in_date: string;
    check_out_date?: string;
    total_adults: number;
    total_children: number;
    notes?: string;
    accommodations: {
        accommodation_id: number;
        quantity: number;
        guests: number;
    }[];
}
