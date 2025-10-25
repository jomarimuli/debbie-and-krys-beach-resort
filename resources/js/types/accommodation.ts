import type { PaginatedData } from './datatable';
import type { AccommodationRate } from './accommodation-rate';

export interface Accommodation {
    id: number;
    name: string;
    type: 'room' | 'cottage';
    size: 'small' | 'big';
    description: string | null;
    is_air_conditioned: boolean;
    images: string[] | null;
    image_urls: string[];
    first_image_url: string | null;
    min_capacity: number | null;
    max_capacity: number | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    rates?: AccommodationRate[];
}

export interface AccommodationIndexData {
    accommodations: PaginatedData<Accommodation>;
}

export interface AccommodationFormData {
    name: string;
    type: 'room' | 'cottage';
    size: 'small' | 'big';
    description?: string;
    is_air_conditioned: boolean;
    images?: File[];
    existing_images?: string[];
    min_capacity?: number;
    max_capacity?: number;
    is_active: boolean;
}
