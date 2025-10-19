import type { PaginatedData, FilterOptions, DataTableState } from './datatable';

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    email_verified_at: string | null;
    password_changed_at: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    roles: string[];
    permissions: string[];
}

export interface UserData extends User {
    status_label: string;
    email_verified: string;
    email_verified_status: 'verified' | 'unverified';
    password_changed: string;
    password_changed_status: 'changed' | 'not-changed';
    roles_text: string;
    roles_count: number;
    can_edit: boolean;
    can_delete: boolean;
    is_admin: boolean;
    is_locked: boolean;
    locked_at: string | null;
}

export interface UserFormData {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    status: string;
    email_verified_at: boolean;
    password_changed_at: boolean;
    roles: string[];
}

export interface UserRole {
    id: number;
    name: string;
    label: string;
}

export interface UserIndexData {
    users: PaginatedData<UserData>;
    availableRoles: UserRole[];
    filterOptions: FilterOptions;
    queryParams: Partial<DataTableState>;
}
