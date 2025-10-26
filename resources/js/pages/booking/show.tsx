import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Booking, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, CheckCircle, LogIn, LogOut, XCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';
import bookings from '@/routes/bookings';
import payments from '@/routes/payments';

export default function Show({ booking }: PageProps & { booking: Booking }) {
    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'outline',
            confirmed: 'default',
            checked_in: 'secondary',
            checked_out: 'secondary',
            cancelled: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'outline'} className="capitalize text-xs">
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    const handleStatusChange = (action: string) => {
        const routes: Record<string, string> = {
            confirm: bookings.confirm.url({ booking: booking.id }),
            checkIn: bookings.checkIn.url({ booking: booking.id }),
            checkOut: bookings.checkOut.url({ booking: booking.id }),
            cancel: bookings.cancel.url({ booking: booking.id }),
        };

        if (routes[action]) {
            router.post(routes[action]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={bookings.index.url()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{booking.booking_number}</h1>
                        <p className="text-sm text-muted-foreground">{booking.guest_name}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {booking.status === 'pending' && (
                        <Button size="sm" onClick={() => handleStatusChange('confirm')}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            Confirm
                        </Button>
                    )}
                    {booking.status === 'confirmed' && (
                        <Button size="sm" onClick={() => handleStatusChange('checkIn')}>
                            <LogIn className="h-3.5 w-3.5 mr-1.5" />
                            Check In
                        </Button>
                    )}
                    {booking.status === 'checked_in' && (
                        <Button size="sm" onClick={() => handleStatusChange('checkOut')}>
                            <LogOut className="h-3.5 w-3.5 mr-1.5" />
                            Check Out
                        </Button>
                    )}
                    {!['cancelled', 'checked_out'].includes(booking.status) && (
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange('cancel')}>
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Cancel
                        </Button>
                    )}
                    <Link href={bookings.edit.url({ booking: booking.id })}>
                        <Button size="sm" variant="outline">
                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Guest Information */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Guest Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                            <p className="text-sm font-medium">{booking.guest_name}</p>
                        </div>
                        {booking.guest_phone && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                                <p className="text-sm font-medium">{booking.guest_phone}</p>
                            </div>
                        )}
                        {booking.guest_email && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                                <p className="text-sm font-medium">{booking.guest_email}</p>
                            </div>
                        )}
                        {booking.guest_address && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                                <p className="text-sm font-medium">{booking.guest_address}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Booking Details */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                            {getStatusBadge(booking.status)}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Type</p>
                            <Badge variant="outline" className="capitalize text-xs">
                                {booking.booking_type.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Check-in Date</p>
                            <p className="text-sm font-medium">
                                {format(new Date(booking.check_in_date), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                        {booking.check_out_date && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Check-out Date</p>
                                <p className="text-sm font-medium">
                                    {format(new Date(booking.check_out_date), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Guests</p>
                            <p className="text-sm font-medium">
                                {booking.total_adults} Adults, {booking.total_children} Children
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Accommodations */}
            {booking.accommodations && booking.accommodations.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Accommodations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {booking.accommodations.map((item) => (
                                <div key={item.id} className="flex justify-between items-start p-2 border rounded text-sm">
                                    <div>
                                        <p className="font-medium">{item.accommodation?.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.guests} guests · {item.accommodation_rate?.booking_type.replace('_', ' ')}
                                        </p>
                                        {parseFloat(item.additional_pax_charge) > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                Additional: ₱{parseFloat(item.additional_pax_charge).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <p className="font-medium">₱{parseFloat(item.subtotal).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-medium">Payment Summary</CardTitle>
                        {parseFloat(booking.balance) > 0 && (
                            <Link href={`${payments.create.url()}?booking_id=${booking.id}`}>
                                <Button size="sm" variant="outline">
                                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                                    Record Payment
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Accommodation Total</span>
                        <span className="font-medium">₱{parseFloat(booking.accommodation_total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entrance Fee Total</span>
                        <span className="font-medium">₱{parseFloat(booking.entrance_fee_total).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-semibold">Total Amount</span>
                        <span className="font-semibold">₱{parseFloat(booking.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Paid Amount</span>
                        <span className="font-medium text-green-600">₱{parseFloat(booking.paid_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-semibold">Balance</span>
                        <span className={`font-semibold ${parseFloat(booking.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₱{parseFloat(booking.balance).toLocaleString()}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {booking.payments.map((payment) => (
                                <Link
                                    key={payment.id}
                                    href={payments.show.url({ payment: payment.id })}
                                    className="flex justify-between items-center p-2 border rounded hover:bg-muted/50 transition-colors"
                                >
                                    <div className="text-sm">
                                        <p className="font-medium">{payment.payment_number}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(payment.payment_date), 'MMM dd, yyyy')} · {payment.payment_method.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <p className="font-medium text-sm">₱{parseFloat(payment.amount).toLocaleString()}</p>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notes */}
            {booking.notes && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{booking.notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Bookings', href: '/bookings' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
