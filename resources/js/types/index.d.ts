// resources/js/types/index.ts

// Re-export all types from sub-modules
export * from './datatable';
export * from './user';
export * from './role';
export * from './accommodation';
export * from './accommodation-rate';
export * from './booking';
export * from './payment';
export * from './payment-account';
export * from './feedback';
export * from './gallery';
export * from './announcement';
export * from './dashboard';
export * from './faq';
export * from './chat';

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
    flash?: Flash;
    [key: string]: unknown;
}

export interface PageProps extends SharedData {
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

export interface WelcomeProps extends PageProps {
    latestAnnouncement: Announcement | null;
    galleries: Gallery[];
    accommodations: Accommodation[];
    feedbacks: Feedback[];
}

// Page-specific props
export type UserIndexProps = PageProps & UserIndexData;
export type RoleIndexProps = PageProps & RoleIndexData;
export type AccommodationIndexProps = PageProps & AccommodationIndexData;
export type AccommodationRateIndexProps = PageProps & AccommodationRateIndexData;
export type BookingIndexProps = PageProps & BookingIndexData;
export type PaymentIndexProps = PageProps & PaymentIndexData;
export type PaymentAccountIndexProps = PageProps & PaymentAccountIndexData;
export type FeedbackIndexProps = PageProps & FeedbackIndexData;
export type GalleryIndexProps = PageProps & GalleryIndexData;
export type AnnouncementIndexProps = PageProps & AnnouncementIndexData;
export type RefundIndexProps = PageProps & RefundIndexData;
export type RebookingIndexProps = PageProps & RebookingIndexData;
export type FAQIndexProps = PageProps & FAQIndexData;
export type ChatIndexProps = PageProps & ChatIndexData;
export type ChatShowProps = PageProps & ChatShowData;
