import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DashboardProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    DollarSign,
    Users,
    Home,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    Star,
    FileText,
    Megaphone,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import bookings from '@/routes/bookings';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    stats,
    recent_bookings = [],
    upcoming_check_ins = [],
    upcoming_bookings = [],
    revenue_chart = []
}: DashboardProps) {
    const { user, isAdmin, isStaff, isCustomer } = useAuth();

    // Type guard to check if stats is AdminDashboardStats
    const isAdminStats = (stats: any): stats is import('@/types').AdminDashboardStats => {
        return 'accommodations' in stats;
    };

    if (isCustomer()) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 p-4">
                    {/* Welcome Message */}
                    <div>
                        <h1 className="text-2xl font-semibold">Welcome back, {user?.name}!</h1>
                        <p className="text-sm text-muted-foreground">Here's your booking overview</p>
                    </div>

                    {/* Customer Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Bookings
                                    </CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.bookings.total}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.bookings.active} active
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Spent
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ₱{Number(stats.financial.total_spent || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All time
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Unpaid Balance
                                    </CardTitle>
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    ₱{Number(stats.financial.unpaid_amount || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Pending payment
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming Bookings */}
                    {upcoming_bookings.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">Upcoming Bookings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {upcoming_bookings.map((booking) => (
                                    <Link
                                        key={booking.id}
                                        href={bookings.show.url({ booking: booking.id })}
                                        className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{booking.booking_number}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Check-in: {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'outline'}>
                                                {booking.status}
                                            </Badge>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Bookings */}
                    {recent_bookings.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">Recent Bookings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {recent_bookings.map((booking) => (
                                    <Link
                                        key={booking.id}
                                        href={bookings.show.url({ booking: booking.id })}
                                        className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{booking.booking_number}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge>{booking.status}</Badge>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </AppLayout>
        );
    }

    // Admin/Staff Dashboard
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Welcome Message */}
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
                    <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
                </div>

                {/* Stats Grid - Row 1: Bookings & Financial */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Bookings
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isAdminStats(stats) ? stats.bookings.total : 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isAdminStats(stats) ? stats.bookings.pending : 0} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Monthly Revenue
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ₱{isAdminStats(stats) ? Number(stats.financial.monthly_revenue || 0).toLocaleString() : 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isAdminStats(stats) ? stats.financial.payments_this_month : 0} payments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Unpaid Balance
                                </CardTitle>
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                ₱{isAdminStats(stats) ? Number(stats.financial.total_unpaid_amount || 0).toLocaleString() : 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isAdminStats(stats) ? stats.financial.unpaid_bookings : 0} bookings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Check-ins Today
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {isAdminStats(stats) ? stats.bookings.checked_in_today : 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Active today
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Grid - Row 2: Accommodations & Others */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Accommodations
                                </CardTitle>
                                <Home className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isAdminStats(stats) ? stats.accommodations.available : 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Available now
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Pending Rebookings
                                </CardTitle>
                                <Clock className="h-4 w-4 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {isAdminStats(stats) ? stats.rebookings.pending : 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Needs review
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Average Rating
                                </CardTitle>
                                <Star className="h-4 w-4 text-yellow-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {isAdminStats(stats) ? Number(stats.feedback.average_rating || 0).toFixed(1) : 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isAdminStats(stats) ? stats.feedback.pending : 0} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    FAQ Searches
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isAdminStats(stats) ? stats.faq.total_searches : 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {isAdminStats(stats) ? stats.faq.no_match_count : 0} unanswered
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Revenue
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ₱{isAdminStats(stats) ? Number(stats.financial.total_revenue || 0).toLocaleString() : 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                All time
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities & Upcoming Check-ins */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Upcoming Check-ins */}
                    {upcoming_check_ins.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">Upcoming Check-ins</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {upcoming_check_ins.map((booking) => (
                                    <Link
                                        key={booking.id}
                                        href={bookings.show.url({ booking: booking.id })}
                                        className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{booking.booking_number}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.guest_name} · {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge>{booking.status}</Badge>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Bookings */}
                    {recent_bookings.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">Recent Bookings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {recent_bookings.map((booking) => (
                                    <Link
                                        key={booking.id}
                                        href={bookings.show.url({ booking: booking.id })}
                                        className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{booking.booking_number}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {booking.guest_name} · {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge>{booking.status}</Badge>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
