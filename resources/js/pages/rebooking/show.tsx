// resources/js/pages/rebooking/show.tsx

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Rebooking, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, CheckCircle, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';
import rebookings from '@/routes/rebookings';
import bookings from '@/routes/bookings';

export default function Show({ rebooking }: PageProps & { rebooking: Rebooking }) {
    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'outline',
            approved: 'default',
            completed: 'secondary',
            cancelled: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'outline'} className="capitalize text-xs">
                {status}
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'outline',
            paid: 'default',
            refunded: 'secondary',
        };

        return (
            <Badge variant={variants[status] || 'outline'} className="capitalize text-xs">
                {status}
            </Badge>
        );
    };

    const handleStatusChange = (action: string) => {
        const routes: Record<string, string> = {
            approve: rebookings.approve.url({ rebooking: rebooking.id }),
            complete: rebookings.complete.url({ rebooking: rebooking.id }),
            cancel: rebookings.cancel.url({ rebooking: rebooking.id }),
        };

        if (routes[action]) {
            router.post(routes[action]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={rebookings.index.url()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{rebooking.rebooking_number}</h1>
                        <p className="text-sm text-muted-foreground">
                            Rebooking for {rebooking.original_booking?.guest_name}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {rebooking.status === 'pending' && (
                        <>
                            <Button size="sm" onClick={() => handleStatusChange('approve')}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                Approve
                            </Button>
                            <Link href={rebookings.edit.url({ rebooking: rebooking.id })}>
                                <Button size="sm" variant="outline">
                                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                                    Edit
                                </Button>
                            </Link>
                        </>
                    )}
                    {rebooking.status === 'approved' && (
                        <Button size="sm" onClick={() => handleStatusChange('complete')}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                            Complete
                        </Button>
                    )}
                    {!['cancelled', 'completed'].includes(rebooking.status) && (
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange('cancel')}>
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Cancel
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Original Booking Information */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">Original Booking</CardTitle>
                            {rebooking.original_booking && (
                                <Link href={bookings.show.url({ booking: rebooking.original_booking.id })}>
                                    <Button variant="ghost" size="sm">
                                        <FileText className="h-3.5 w-3.5 mr-1.5" />
                                        View
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {rebooking.original_booking && (
                            <>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Booking Number</p>
                                    <p className="text-sm font-medium">{rebooking.original_booking.booking_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Guest Name</p>
                                    <p className="text-sm font-medium">{rebooking.original_booking.guest_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Check-in Date</p>
                                    <p className="text-sm font-medium">
                                        {format(new Date(rebooking.original_booking.check_in_date), 'MMMM dd, yyyy')}
                                    </p>
                                </div>
                                {rebooking.original_booking.check_out_date && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-0.5">Check-out Date</p>
                                        <p className="text-sm font-medium">
                                            {format(new Date(rebooking.original_booking.check_out_date), 'MMMM dd, yyyy')}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Original Guests</p>
                                    <p className="text-sm font-medium">
                                        {rebooking.original_booking.total_adults} Adults, {rebooking.original_booking.total_children} Children
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Original Amount</p>
                                    <p className="text-sm font-medium">₱{parseFloat(rebooking.original_amount).toLocaleString()}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Rebooking Details */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Rebooking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                            <div className="flex gap-2">
                                {getStatusBadge(rebooking.status)}
                                {getPaymentStatusBadge(rebooking.payment_status)}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">New Check-in Date</p>
                            <p className="text-sm font-medium">
                                {format(new Date(rebooking.new_check_in_date), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                        {rebooking.new_check_out_date && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">New Check-out Date</p>
                                <p className="text-sm font-medium">
                                    {format(new Date(rebooking.new_check_out_date), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">New Guests</p>
                            <p className="text-sm font-medium">
                                {rebooking.new_total_adults} Adults, {rebooking.new_total_children} Children
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">New Amount</p>
                            <p className="text-sm font-medium">₱{parseFloat(rebooking.new_amount).toLocaleString()}</p>
                        </div>
                        {rebooking.processed_by_user && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Processed By</p>
                                <p className="text-sm font-medium">{rebooking.processed_by_user.name}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* New Accommodations */}
            {rebooking.accommodations && rebooking.accommodations.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">New Accommodations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {rebooking.accommodations.map((item) => (
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
                                        {item.free_entrance_used > 0 && (
                                            <p className="text-xs text-blue-600">
                                                Free entrance: {item.free_entrance_used} pax
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

            {/* New Entrance Fees */}
            {rebooking.entrance_fees && rebooking.entrance_fees.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">New Entrance Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {rebooking.entrance_fees.map((fee) => (
                                <div key={fee.id} className="flex justify-between items-center p-2 border rounded text-sm">
                                    <div>
                                        <p className="font-medium capitalize">{fee.type}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {fee.quantity} × ₱{parseFloat(fee.rate).toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="font-medium">₱{parseFloat(fee.subtotal).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Financial Summary */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Original Amount</span>
                        <span className="font-medium">₱{parseFloat(rebooking.original_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">New Amount</span>
                        <span className="font-medium">₱{parseFloat(rebooking.new_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-semibold">Amount Difference</span>
                        <span className={`font-semibold ${parseFloat(rebooking.amount_difference) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {parseFloat(rebooking.amount_difference) >= 0 ? '+' : ''}₱{parseFloat(rebooking.amount_difference).toLocaleString()}
                        </span>
                    </div>
                    {parseFloat(rebooking.rebooking_fee) > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Rebooking Fee</span>
                            <span className="font-medium text-red-600">₱{parseFloat(rebooking.rebooking_fee).toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm border-t pt-2">
                        <span className="font-semibold">Total Adjustment</span>
                        <span className={`font-semibold ${parseFloat(rebooking.total_adjustment) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {parseFloat(rebooking.total_adjustment) >= 0 ? '+' : ''}₱{parseFloat(rebooking.total_adjustment).toLocaleString()}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Reason & Notes */}
            {(rebooking.reason || rebooking.admin_notes) && (
                <div className="grid gap-4 md:grid-cols-2">
                    {rebooking.reason && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">Reason</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{rebooking.reason}</p>
                            </CardContent>
                        </Card>
                    )}
                    {rebooking.admin_notes && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">Admin Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{rebooking.admin_notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Timeline */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Created</p>
                        <p className="text-sm font-medium">
                            {format(new Date(rebooking.created_at), 'MMMM dd, yyyy · h:mm a')}
                        </p>
                    </div>
                    {rebooking.approved_at && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Approved</p>
                            <p className="text-sm font-medium">
                                {format(new Date(rebooking.approved_at), 'MMMM dd, yyyy · h:mm a')}
                            </p>
                        </div>
                    )}
                    {rebooking.completed_at && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Completed</p>
                            <p className="text-sm font-medium">
                                {format(new Date(rebooking.completed_at), 'MMMM dd, yyyy · h:mm a')}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Rebookings', href: '/rebookings' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
