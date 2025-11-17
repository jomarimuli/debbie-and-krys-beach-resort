import type { PaginatedData } from './datatable';

export interface Gallery {
    id: number;
    title: string;
    description: string | null;
    image: string;
    image_url: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface GalleryIndexData {
    galleries: PaginatedData<Gallery>;
}

export interface GalleryFormData {
    title: string;
    description?: string;
    image?: File | null;
    is_active: boolean;
    sort_order: number;
}
