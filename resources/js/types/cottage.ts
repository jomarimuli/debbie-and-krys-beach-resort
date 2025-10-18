import type { PaginatedData, FilterOptions, DataTableState } from './datatable';

export interface Cottage {
    id: number;
    name: string;
    size: string;
    description: string | null;
    max_pax: number;
    day_tour_price: number;
    overnight_price: number;
    quantity: number;
    images: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CottageData extends Cottage {
    available_quantity: number;
    size_label: string;
    status_label: string;
    formatted_day_tour_price: string;
    formatted_overnight_price: string;
}

export interface CottageFormData {
    name: string;
    size: string;
    description: string | null;
    max_pax: number;
    day_tour_price: number;
    overnight_price: number;
    quantity: number;
    images: string[] | null;
    is_active: boolean;
}

export interface CottageIndexData {
    cottages: PaginatedData<CottageData>;
    filterOptions: FilterOptions;
    queryParams: Partial<DataTableState>;
}
