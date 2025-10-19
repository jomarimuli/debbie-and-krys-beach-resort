// resources/js/types/accommodation.ts
import type { PaginatedData } from './datatable';
import type { User } from './user';

export interface Accommodation {
    id: number;
    name: string;
    type: 'room' | 'cottage';
    description: string | null;
    min_capacity: number | null;
    max_capacity: number | null;
    quantity_available: number;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    rates?: AccommodationRate[];
}

export interface AccommodationRate {
    id: number;
    accommodation_id: number;
    booking_type: 'day_tour' | 'overnight';
    rate: string;
    base_capacity: number | null;
    additional_pax_rate: string | null;
    entrance_fee: string | null;
    child_entrance_fee: string | null;
    child_max_age: number | null;
    includes_free_cottage: boolean;
    includes_free_entrance: boolean;
    effective_from: string | null;
    effective_to: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    accommodation?: Accommodation;
}

export interface AccommodationIndexData {
    accommodations: PaginatedData<Accommodation>;
}

export interface AccommodationFormData {
    name: string;
    type: 'room' | 'cottage';
    description?: string;
    min_capacity?: number;
    max_capacity?: number;
    quantity_available: number;
    is_active: boolean;
}

export interface AccommodationRateFormData {
    accommodation_id: number;
    booking_type: 'day_tour' | 'overnight';
    rate: number;
    base_capacity?: number;
    additional_pax_rate?: number;
    entrance_fee?: number;
    child_entrance_fee?: number;
    child_max_age?: number;
    includes_free_cottage: boolean;
    includes_free_entrance: boolean;
    effective_from?: string;
    effective_to?: string;
    is_active: boolean;
}
