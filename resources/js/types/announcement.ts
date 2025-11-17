import type { PaginatedData } from './datatable';

export interface Announcement {
    id: number;
    title: string;
    content: string;
    is_active: boolean;
    published_at: string | null;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface AnnouncementIndexData {
    announcements: PaginatedData<Announcement>;
}

export interface AnnouncementFormData {
    title: string;
    content: string;
    is_active: boolean;
    published_at?: string;
    expires_at?: string;
}
