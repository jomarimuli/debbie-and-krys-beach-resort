import type { PaginatedData } from './datatable';
import type { Payment } from './payment';

export interface PaymentAccount {
    id: number;
    type: 'bank' | 'gcash' | 'maya' | 'other';
    account_name: string;
    account_number: string | null;
    bank_name: string | null;
    qr_code: string | null;
    qr_code_url: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    payments?: Payment[];
}

export interface PaymentAccountIndexData {
    payment_accounts: PaginatedData<PaymentAccount>;
}

export interface PaymentAccountFormData {
    type: 'bank' | 'gcash' | 'maya' | 'other';
    account_name: string;
    account_number?: string;
    bank_name?: string;
    qr_code?: File | null;
    remove_qr_code?: boolean;
    is_active: boolean;
    sort_order: number;
}
