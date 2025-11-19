// resources/js/types/calendar.ts
export interface CalendarAccommodation {
    id: number;
    name: string;
    type: 'room' | 'cottage';
    size: 'small' | 'big';
    is_air_conditioned: boolean;
    min_capacity: number;
    max_capacity: number;
    first_image_url: string | null;
    day_tour_rate: string | null;
    overnight_rate: string | null;
    is_available: boolean;
    booking: CalendarBooking | null;
}

export interface CalendarBooking {
    booking_number: string;
    guest_name: string;
    check_in_date: string;
    check_out_date: string | null;
    status: string;
    booking_type: 'day_tour' | 'overnight';
}

export interface DayOverview {
    total: number;
    available: number;
    booked: number;
    status: 'full' | 'available' | 'partial';
}

export interface MonthOverview {
    [date: string]: DayOverview;
}

export interface CalendarIndexData {
    selectedDate: string;
    accommodations: CalendarAccommodation[];
    monthOverview: MonthOverview;
}
