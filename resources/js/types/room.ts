import type { PaginatedData, FilterOptions, DataTableState } from './datatable';

export interface Room {
    id: number;
    name: string;
    size: string;
    description: string | null;
    max_pax: number;
    day_tour_price: number;
    overnight_price: number | null;
    quantity: number;
    has_ac: boolean;
    free_entrance_count: number;
    free_cottage_size: string | null;
    excess_pax_fee: number;
    images: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface RoomData extends Room {
    available_quantity: number;
    size_label: string;
    status_label: string;
    formatted_day_tour_price: string;
    formatted_overnight_price: string;
    formatted_excess_pax_fee: string;
}

export interface RoomFormData {
    name: string;
    size: string;
    description: string | null;
    max_pax: number;
    day_tour_price: number;
    overnight_price: number | null;
    quantity: number;
    has_ac: boolean;
    free_entrance_count: number;
    free_cottage_size: string | null;
    excess_pax_fee: number;
    images: string[] | null;
    is_active: boolean;
}

export interface RoomIndexData {
    rooms: PaginatedData<RoomData>;
    filterOptions: FilterOptions;
    queryParams: Partial<DataTableState>;
}
