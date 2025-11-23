// resources/js/types/calendar.ts

export interface CalendarBooking {
    booking_number: string;
    guest_name: string;
    check_in_date: string;
    check_out_date: string | null;
    status: string;
}

export interface AccommodationRate {
    rate: number;
    additional_pax_rate: number;
    adult_entrance_fee: number;
    child_entrance_fee: number;
    child_max_age: number;
    includes_free_cottage: boolean;
    includes_free_entrance: boolean;
    is_available: boolean;
    booking: CalendarBooking | null;
}

export interface CalendarAccommodation {
    id: number;
    name: string;
    type: 'room' | 'cottage';
    size: 'small' | 'big';
    is_air_conditioned: boolean;
    min_capacity: number;
    max_capacity: number;
    first_image_url: string | null;
    day_tour_rate: AccommodationRate | null;
    overnight_rate: AccommodationRate | null;
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
