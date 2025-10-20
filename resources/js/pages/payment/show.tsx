import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Payment, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function Show({ payment }: PageProps & { payment: Payment }) {
    const [imageModalOpen, setImageModalOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/payments">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{payment.payment_number}</h1>
                        <p className="text-muted-foreground">Payment details</p>
                    </div>
                </div>
                <Link href={`/payments/${payment.id}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>
            </div>

            {/* Reference Image Display */}
            {payment.reference_image_url && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Reference Image</CardTitle>
                        <CardDescription>Proof of payment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative inline-block">
                            <img
                                src={payment.reference_image_url}
                                alt="Payment reference"
                                className="w-full max-w-2xl h-96 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setImageModalOpen(true)}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                Click image to view full size
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Payment Number</p>
                            <p className="font-medium">{payment.payment_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="text-2xl font-bold">₱{parseFloat(payment.amount).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Payment Method</p>
                            <Badge variant="outline" className="capitalize">
                                {payment.payment_method.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Payment Date</p>
                            <p className="font-medium">
                                {format(new Date(payment.payment_date), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                        {payment.reference_number && (
                            <div>
                                <p className="text-sm text-muted-foreground">Reference Number</p>
                                <p className="font-medium">{payment.reference_number}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Booking Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Booking Number</p>
                            <Link
                                href={`/bookings/${payment.booking_id}`}
                                className="font-medium text-blue-600 hover:underline"
                            >
                                {payment.booking?.booking_number}
                            </Link>
                        </div>
                        {payment.booking && (
                            <>
                                <div>
                                    <p className="text-sm text-muted-foreground">Guest Name</p>
                                    <p className="font-medium">{payment.booking.guest_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Amount</p>
                                    <p className="font-medium">
                                        ₱{parseFloat(payment.booking.total_amount).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className="font-medium text-red-600">
                                        ₱{parseFloat(payment.booking.balance).toLocaleString()}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {payment.notes && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{payment.notes}</p>
                    </CardContent>
                </Card>
            )}

            {payment.received_by_user && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Received By</p>
                            <p className="font-medium">{payment.received_by_user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Recorded At</p>
                            <p className="font-medium">
                                {format(new Date(payment.created_at), 'MMMM dd, yyyy HH:mm')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Image Modal */}
            {imageModalOpen && payment.reference_image_url && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setImageModalOpen(false)}
                >
                    <div className="relative max-w-7xl max-h-[90vh]">
                        <img
                            src={payment.reference_image_url}
                            alt="Payment reference full size"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-4 right-4"
                            onClick={() => setImageModalOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </>
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
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {page}
        </div>
    </AppLayout>
);
