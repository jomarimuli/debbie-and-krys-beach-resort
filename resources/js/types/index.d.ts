// resources/js/types/index.ts
import type { User, UserIndexData } from './user';
import type { RoleIndexData } from './role';
import type { RoomIndexData } from './room';
import type { CottageIndexData } from './cottage';
import type { EntranceFeeIndexData } from './entrance-fee';
import type { BookingIndexData } from './booking';

export * from './datatable';
export * from './user';
export * from './role';
export * from './room';
export * from './cottage';
export * from './entrance-fee';
export * from './booking';

// Common types
export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    requiredPermissions?: string[];
    isExternal?: boolean;
}

export interface Flash {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
}

export interface GitHubChangeItem {
    text: string;
    type: 'header' | 'item' | 'more';
}

export interface GitHubUpdate {
    version: string;
    date: string;
    type: string;
    title: string;
    description: string;
    changes: GitHubChangeItem[];
    html_url: string;
    author: string;
}

// Shared data types
export interface Auth {
    user: User | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface PageProps extends SharedData {
    flash?: Flash;
    [key: string]: unknown;
}

export interface AppSidebarHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    notifications?: Notification[];
    loading?: boolean;
    onMarkAsRead?: (notificationId: string) => void;
    onMarkAllAsRead?: () => void;
    onRemoveNotification?: (notificationId: string) => void;
    onRefreshNotifications?: () => void;
}

// Page-specific props
export type UserIndexProps = PageProps & UserIndexData;
export type RoleIndexProps = PageProps & RoleIndexData;
export type RoomIndexProps = PageProps & RoomIndexData;
export type CottageIndexProps = PageProps & CottageIndexData;
export type EntranceFeeIndexProps = PageProps & EntranceFeeIndexData;
export type BookingIndexProps = PageProps & BookingIndexData;
