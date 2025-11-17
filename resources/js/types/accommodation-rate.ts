import type { PaginatedData } from './datatable';
import type { Accommodation } from './accommodation';

export interface AccommodationRate {
    id: number;
    accommodation_id: number;
    booking_type: 'day_tour' | 'overnight';
    rate: string;
    additional_pax_rate: string | null;
    adult_entrance_fee: string | null;
    child_entrance_fee: string | null;
    child_max_age: number | null;
    includes_free_cottage: boolean;
    includes_free_entrance: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    accommodation?: Accommodation;
}

export interface AccommodationRateIndexData {
    rates: PaginatedData<AccommodationRate>;
}

export interface AccommodationRateFormData {
    accommodation_id: string;
    booking_type: 'day_tour' | 'overnight';
    rate: string;
    additional_pax_rate?: string;
    adult_entrance_fee?: string;
    child_entrance_fee?: string;
    child_max_age?: string;
    includes_free_cottage: boolean;
    includes_free_entrance: boolean;
    is_active: boolean;
}
