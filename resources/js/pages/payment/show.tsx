import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Payment, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import payments from '@/routes/payments';
import bookings from '@/routes/bookings';

export default function Show({ payment }: PageProps & { payment: Payment }) {
    const [imageModalOpen, setImageModalOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={payments.index.url()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{payment.payment_number}</h1>
                        <p className="text-sm text-muted-foreground">Payment details</p>
                    </div>
                </div>
                <Link href={payments.edit.url({ payment: payment.id })}>
                    <Button size="sm">
                        <Edit className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                    </Button>
                </Link>
            </div>

            {payment.reference_image_url && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Reference Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative inline-block">
                            <img
                                src={payment.reference_image_url}
                                alt="Payment reference"
                                className="w-full max-w-2xl h-64 object-cover rounded border cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setImageModalOpen(true)}
                            />
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Click to view full size
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Payment Number</p>
                            <p className="text-sm font-medium">{payment.payment_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                            <p className="text-xl font-bold">₱{parseFloat(payment.amount).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Payment Method</p>
                            <Badge variant="outline" className="capitalize text-xs">
                                {payment.payment_method.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Payment Date</p>
                            <p className="text-sm font-medium">
                                {format(new Date(payment.payment_date), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                        {payment.reference_number && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Reference Number</p>
                                <p className="text-sm font-medium">{payment.reference_number}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Booking Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Booking Number</p>
                            <Link
                                href={bookings.show.url({ booking: payment.booking_id })}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                {payment.booking?.booking_number}
                            </Link>
                        </div>
                        {payment.booking && (
                            <>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Guest Name</p>
                                    <p className="text-sm font-medium">{payment.booking.guest_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
                                    <p className="text-sm font-medium">
                                        ₱{parseFloat(payment.booking.total_amount).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Balance</p>
                                    <p className="text-sm font-medium text-red-600">
                                        ₱{parseFloat(payment.booking.balance).toLocaleString()}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {payment.notes && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{payment.notes}</p>
                    </CardContent>
                </Card>
            )}

            {payment.received_by_user && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Received By</p>
                            <p className="text-sm font-medium">{payment.received_by_user.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Recorded At</p>
                            <p className="text-sm font-medium">
                                {format(new Date(payment.created_at), 'MMMM dd, yyyy HH:mm')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {imageModalOpen && payment.reference_image_url && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setImageModalOpen(false)}
                >
                    <div className="relative max-w-7xl max-h-[90vh]">
                        <img
                            src={payment.reference_image_url}
                            alt="Payment reference full size"
                            className="max-w-full max-h-[90vh] object-contain rounded"
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setImageModalOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Payments', href: '/payments' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
