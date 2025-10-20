// resources/js/types/datatable.ts
export interface DataTableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    searchable?: boolean;
    filterable?: boolean;
    width?: string;
    className?: string;
}

export interface DataTableState {
    search: string;
    sort: string;
    direction: 'asc' | 'desc';
    perPage: number;
    page: number;
    filters: Record<string, string[]>;
    columnVisibility: Record<string, boolean>;
}

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterOptions {
    [key: string]: FilterOption[] | string[];
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}
