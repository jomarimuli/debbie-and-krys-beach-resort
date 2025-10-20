// resources/js/pages/booking/show.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Booking, type PageProps } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, CheckCircle, LogIn, LogOut, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
            <Badge variant={variants[status] || 'outline'} className="capitalize">
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    const handleStatusChange = (action: string) => {
        router.post(`/bookings/${booking.id}/${action}`);
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/bookings">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{booking.booking_number}</h1>
                        <p className="text-muted-foreground">{booking.guest_name}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {booking.status === 'pending' && (
                        <Button onClick={() => handleStatusChange('confirm')} variant="default">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                        </Button>
                    )}
                    {booking.status === 'confirmed' && (
                        <Button onClick={() => handleStatusChange('check-in')} variant="default">
                            <LogIn className="mr-2 h-4 w-4" />
                            Check In
                        </Button>
                    )}
                    {booking.status === 'checked_in' && (
                        <Button onClick={() => handleStatusChange('check-out')} variant="default">
                            <LogOut className="mr-2 h-4 w-4" />
                            Check Out
                        </Button>
                    )}
                    {['pending', 'confirmed'].includes(booking.status) && (
                        <Button onClick={() => handleStatusChange('cancel')} variant="destructive">
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    )}
                    <Link href={`/bookings/${booking.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Booking Number</p>
                            <p className="font-medium">{booking.booking_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            {getStatusBadge(booking.status)}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Source</p>
                            <Badge variant="outline" className="capitalize">
                                {booking.source}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Booking Type</p>
                            <Badge variant="outline" className="capitalize">
                                {booking.booking_type.replace('_', ' ')}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Guest Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{booking.guest_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{booking.guest_phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{booking.guest_email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Guests</p>
                            <p className="font-medium">
                                {booking.total_adults} Adults, {booking.total_children} Children
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Check-in Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Check-in Date</p>
                            <p className="font-medium">
                                {format(new Date(booking.check_in_date), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                        {booking.check_out_date && (
                            <div>
                                <p className="text-sm text-muted-foreground">Check-out Date</p>
                                <p className="font-medium">
                                    {format(new Date(booking.check_out_date), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Accommodations</CardTitle>
                    <CardDescription>Booked rooms and cottages</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Accommodation</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Additional Charge</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {booking.accommodations?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        {item.accommodation?.name}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.guests}</TableCell>
                                    <TableCell>₱{parseFloat(item.rate).toLocaleString()}</TableCell>
                                    <TableCell>
                                        {parseFloat(item.additional_pax_charge) > 0
                                            ? `₱${parseFloat(item.additional_pax_charge).toLocaleString()}`
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ₱{parseFloat(item.subtotal).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {booking.entrance_fees && booking.entrance_fees.length > 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Entrance Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Rate</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {booking.entrance_fees.map((fee) => (
                                    <TableRow key={fee.id}>
                                        <TableCell className="capitalize font-medium">{fee.type}</TableCell>
                                        <TableCell>{fee.quantity}</TableCell>
                                        <TableCell>₱{parseFloat(fee.rate).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            ₱{parseFloat(fee.subtotal).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Accommodation Total</p>
                            <p className="font-medium">₱{parseFloat(booking.accommodation_total).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Entrance Fees</p>
                            <p className="font-medium">₱{parseFloat(booking.entrance_fee_total).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between border-t pt-4">
                            <p className="font-semibold">Total Amount</p>
                            <p className="font-semibold">₱{parseFloat(booking.total_amount).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Paid Amount</p>
                            <p className="font-medium text-green-600">₱{parseFloat(booking.paid_amount).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between border-t pt-4">
                            <p className="font-semibold">Balance</p>
                            <p className="font-semibold text-red-600">₱{parseFloat(booking.balance).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Payments</CardTitle>
                            <Link href={`/payments/create?booking_id=${booking.id}`}>
                                <Button size="sm">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Add Payment
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {booking.payments && booking.payments.length > 0 ? (
                            <div className="space-y-4">
                                {booking.payments.map((payment) => (
                                    <div key={payment.id} className="flex justify-between items-center border-b pb-3">
                                        <div>
                                            <p className="font-medium">{payment.payment_number}</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {payment.payment_method.replace('_', ' ')}
                                            </p>
                                        </div>
                                        <p className="font-medium">₱{parseFloat(payment.amount).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {booking.notes && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{booking.notes}</p>
                    </CardContent>
                </Card>
            )}
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Bookings', href: '/bookings' },
            { title: 'Details', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
