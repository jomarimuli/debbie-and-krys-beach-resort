// resources/js/pages/calendar/index.tsx

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Hotel, Users, DollarSign } from 'lucide-react';
import { type CalendarIndexProps, type CalendarAccommodation } from '@/types';
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import calendar from '@/routes/calendar';
import { router } from '@inertiajs/react';

export default function Index({ selectedDate, accommodations, monthOverview }: CalendarIndexProps) {
    const currentDate = new Date(selectedDate);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const handlePrevDay = () => {
        const prev = subDays(currentDate, 1);
        router.visit(calendar.show.url({ date: format(prev, 'yyyy-MM-dd') }));
    };

    const handleNextDay = () => {
        const next = addDays(currentDate, 1);
        router.visit(calendar.show.url({ date: format(next, 'yyyy-MM-dd') }));
    };

    const handleToday = () => {
        router.visit(calendar.index.url());
    };

    const handleDateClick = (date: Date) => {
        router.visit(calendar.show.url({ date: format(date, 'yyyy-MM-dd') }));
    };

    const handlePrevMonth = () => {
        const prev = subMonths(currentDate, 1);
        router.visit(calendar.show.url({ date: format(prev, 'yyyy-MM-dd') }));
    };

    const handleNextMonth = () => {
        const next = addMonths(currentDate, 1);
        router.visit(calendar.show.url({ date: format(next, 'yyyy-MM-dd') }));
    };

    const getDayStatus = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return monthOverview[dateStr];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'full':
                return 'bg-red-500';
            case 'partial':
                return 'bg-yellow-500';
            case 'available':
                return 'bg-green-500';
            default:
                return 'bg-gray-300';
        }
    };

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined) return 'N/A';
        return `₱${parseFloat(amount.toString()).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // Calculate available/booked count based on booking types
    const availableCount = accommodations.filter((a: CalendarAccommodation) =>
        (a.day_tour_rate?.is_available || a.overnight_rate?.is_available)
    ).length;
    const bookedCount = accommodations.length - availableCount;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Accommodation Calendar</h1>
                    <p className="text-sm text-muted-foreground">
                        View accommodation availability
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleToday}>
                        Today
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Total Accommodations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{accommodations.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">{availableCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Booked</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">{bookedCount}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-medium">
                                    {format(currentDate, 'MMMM dd, yyyy')}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {format(currentDate, 'EEEE')}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevDay}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextDay}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {accommodations.map((accommodation: CalendarAccommodation) => (
                                <div
                                    key={accommodation.id}
                                    className="flex flex-col gap-3 p-3 border rounded"
                                >
                                    <div className="flex items-center gap-3">
                                        {accommodation.first_image_url ? (
                                            <img
                                                src={accommodation.first_image_url}
                                                alt={accommodation.name}
                                                className="h-12 w-12 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                                <Hotel className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{accommodation.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="capitalize">{accommodation.type}</span>
                                                <span>·</span>
                                                <span className="capitalize">{accommodation.size}</span>
                                                {accommodation.is_air_conditioned && (
                                                    <>
                                                        <span>·</span>
                                                        <span>AC</span>
                                                    </>
                                                )}
                                                <span>·</span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {accommodation.min_capacity}-{accommodation.max_capacity} pax
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 text-xs">
                                        {accommodation.day_tour_rate && (
                                            <div className={cn(
                                                'flex-1 p-2 rounded border',
                                                accommodation.day_tour_rate.is_available
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-red-50 border-red-200'
                                            )}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-medium">Day Tour</p>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'text-xs',
                                                            accommodation.day_tour_rate.is_available
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        )}
                                                    >
                                                        {accommodation.day_tour_rate.is_available ? 'Available' : 'Booked'}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-0.5 text-muted-foreground">
                                                    <p className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        Base: {formatCurrency(accommodation.day_tour_rate.rate)}
                                                    </p>
                                                    <p>Extra Pax: {formatCurrency(accommodation.day_tour_rate.additional_pax_rate)}</p>
                                                    {accommodation.day_tour_rate.includes_free_cottage && (
                                                        <p className="text-green-600">Free Cottage</p>
                                                    )}
                                                    {accommodation.day_tour_rate.includes_free_entrance && (
                                                        <p className="text-green-600">Free Entrance</p>
                                                    )}
                                                    {!accommodation.day_tour_rate.is_available && accommodation.day_tour_rate.booking && (
                                                        <p className="text-red-600 font-medium mt-1">
                                                            {accommodation.day_tour_rate.booking.guest_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {accommodation.overnight_rate && (
                                            <div className={cn(
                                                'flex-1 p-2 rounded border',
                                                accommodation.overnight_rate.is_available
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-red-50 border-red-200'
                                            )}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-medium">Overnight</p>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'text-xs',
                                                            accommodation.overnight_rate.is_available
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        )}
                                                    >
                                                        {accommodation.overnight_rate.is_available ? 'Available' : 'Booked'}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-0.5 text-muted-foreground">
                                                    <p className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        Base: {formatCurrency(accommodation.overnight_rate.rate)}
                                                    </p>
                                                    <p>Extra Pax: {formatCurrency(accommodation.overnight_rate.additional_pax_rate)}</p>
                                                    {accommodation.overnight_rate.includes_free_cottage && (
                                                        <p className="text-green-600">Free Cottage</p>
                                                    )}
                                                    {accommodation.overnight_rate.includes_free_entrance && (
                                                        <p className="text-green-600">Free Entrance</p>
                                                    )}
                                                    {!accommodation.overnight_rate.is_available && accommodation.overnight_rate.booking && (
                                                        <p className="text-red-600 font-medium mt-1">
                                                            {accommodation.overnight_rate.booking.guest_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">
                                {format(currentDate, 'MMMM yyyy')}
                            </CardTitle>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <div key={i} className="font-medium text-muted-foreground py-1">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square" />
                            ))}
                            {monthDays.map((day) => {
                                const dayStatus = getDayStatus(day);
                                const isSelected = isSameDay(day, currentDate);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => handleDateClick(day)}
                                        className={cn(
                                            'aspect-square p-1 text-xs rounded relative hover:bg-muted transition-colors',
                                            isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                                            isToday && !isSelected && 'border-2 border-primary'
                                        )}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <span>{format(day, 'd')}</span>
                                            {dayStatus && (
                                                <div className={cn('w-1.5 h-1.5 rounded-full mt-0.5', getStatusColor(dayStatus.status))} />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-4 space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>All Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span>Partially Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>Fully Booked</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Calendar', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
