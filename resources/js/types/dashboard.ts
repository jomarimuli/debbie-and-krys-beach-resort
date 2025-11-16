// resources/js/types/dashboard.ts

import type { PageProps as BasePageProps } from './index';
import type { Booking } from './booking';

export interface BookingStats {
    total: number;
    pending: number;
    confirmed: number;
    checked_in_today: number;
    by_status: Record<string, number>;
}

export interface FinancialStats {
    monthly_revenue: number;
    total_revenue: number;
    unpaid_bookings: number;
    total_unpaid_amount: number;
    payments_this_month: number;
}

export interface RebookingStats {
    pending: number;
    approved: number;
}

export interface AccommodationStats {
    total: number;
    occupied: number;
    available: number;
}

export interface FeedbackStats {
    pending: number;
    average_rating: number;
}

export interface FAQStats {
    total_searches: number;
    helpful_count: number;
    not_helpful_count: number;
    no_match_count: number;
}

export interface AdminDashboardStats {
    bookings: BookingStats;
    financial: FinancialStats;
    rebookings: RebookingStats;
    accommodations: AccommodationStats;
    feedback: FeedbackStats;
    faq: FAQStats;
}

export interface CustomerBookingStats {
    total: number;
    active: number;
    completed: number;
}

export interface CustomerFinancialStats {
    total_spent: number;
    unpaid_amount: number;
}

export interface CustomerRebookingStats {
    pending: number;
}

export interface CustomerDashboardStats {
    bookings: CustomerBookingStats;
    financial: CustomerFinancialStats;
    rebookings: CustomerRebookingStats;
}

export interface RevenueChartData {
    date: string;
    revenue: number;
}

export interface DashboardProps extends BasePageProps {
    stats: AdminDashboardStats | CustomerDashboardStats;
    recent_bookings: Booking[];
    upcoming_check_ins?: Booking[];
    upcoming_bookings?: Booking[];
    revenue_chart?: RevenueChartData[];
}
