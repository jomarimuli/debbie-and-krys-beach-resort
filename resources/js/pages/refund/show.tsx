import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Refund, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, QrCode, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import refunds from '@/routes/refunds';
import payments from '@/routes/payments';
import rebookings from '@/routes/rebookings';

const refundMethodLabels: Record<string, string> = {
    cash: 'Cash',
    bank: 'Bank',
    gcash: 'GCash',
    maya: 'Maya',
    original_method: 'Original Method',
    other: 'Other',
};

const refundMethodColors: Record<string, string> = {
    cash: 'bg-green-100 text-green-800',
    bank: 'bg-purple-100 text-purple-800',
    gcash: 'bg-teal-100 text-teal-800',
    maya: 'bg-orange-100 text-orange-800',
    original_method: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-800',
};

import { useAuth } from '@/hooks/use-auth';

export default function Show({ refund }: PageProps & { refund: Refund }) {
    const { can, isAdmin, isStaff } = useAuth();
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={refunds.index.url()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{refund.refund_number}</h1>
                        <p className="text-sm text-muted-foreground">Refund details</p>
                    </div>
                </div>
                {/* Only admin/staff can edit */}
                {(isAdmin() || isStaff()) && can('refund edit') && (
                    <Link href={refunds.edit.url({ refund: refund.id })}>
                        <Button size="sm">
                            <Edit className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                        </Button>
                    </Link>
                )}
            </div>

            {refund.is_rebooking_refund && refund.rebooking && (
                <Card className="border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Rebooking Refund
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Rebooking Number:</span>
                            <Link
                                href={rebookings.show.url({ rebooking: refund.rebooking_id! })}
                                className="font-medium text-primary hover:underline"
                            >
                                {refund.rebooking.rebooking_number}
                            </Link>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant="outline" className="text-xs capitalize">
                                {refund.rebooking.status}
                            </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount Difference:</span>
                            <span className="font-medium text-red-600">
                                -₱{parseFloat(refund.rebooking.amount_difference).toLocaleString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {refund.reference_image_url && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Reference Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative inline-block">
                            <img
                                src={refund.reference_image_url}
                                alt="Refund reference"
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
                        <CardTitle className="text-base font-medium">Refund Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Refund Number</p>
                            <p className="text-sm font-medium">{refund.refund_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                            <div className="flex items-center gap-2">
                                <p className="text-xl font-bold text-red-600">-₱{parseFloat(refund.amount).toLocaleString()}</p>
                                {refund.is_rebooking_refund && (
                                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                        Rebooking
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Refund Method</p>
                            <Badge variant="outline" className={`capitalize text-xs ${refundMethodColors[refund.refund_method]}`}>
                                {refundMethodLabels[refund.refund_method]}
                            </Badge>
                        </div>

                        {refund.refund_account && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Refund Account</p>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{refund.refund_account.account_name}</p>
                                    {refund.refund_account.account_number && (
                                        <p className="text-xs text-muted-foreground">{refund.refund_account.account_number}</p>
                                    )}
                                    {refund.refund_account.bank_name && (
                                        <p className="text-xs text-muted-foreground">{refund.refund_account.bank_name}</p>
                                    )}
                                    {refund.refund_account.qr_code_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => setQrModalOpen(true)}
                                        >
                                            <QrCode className="mr-1.5 h-3.5 w-3.5" />
                                            View QR Code
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Refund Date</p>
                            <p className="text-sm font-medium">
                                {format(new Date(refund.refund_date), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                        {refund.reference_number && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Reference Number</p>
                                <p className="text-sm font-medium">{refund.reference_number}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Payment Number</p>
                            <Link
                                href={payments.show.url({ payment: refund.payment_id })}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                {refund.payment?.payment_number}
                            </Link>
                        </div>
                        {refund.payment && (
                            <>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Guest Name</p>
                                    <p className="text-sm font-medium">{refund.payment.booking?.guest_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Booking Number</p>
                                    <p className="text-sm font-medium">{refund.payment.booking?.booking_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Original Payment Amount</p>
                                    <p className="text-sm font-medium">
                                        ₱{parseFloat(refund.payment.amount).toLocaleString()}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {refund.reason && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Reason</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{refund.reason}</p>
                    </CardContent>
                </Card>
            )}

            {refund.notes && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{refund.notes}</p>
                    </CardContent>
                </Card>
            )}

            {refund.processed_by_user && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Processed By</p>
                            <p className="text-sm font-medium">{refund.processed_by_user.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Processed At</p>
                            <p className="text-sm font-medium">
                                {format(new Date(refund.created_at), 'MMMM dd, yyyy HH:mm')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reference Image Modal */}
            {imageModalOpen && refund.reference_image_url && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setImageModalOpen(false)}
                >
                    <div className="relative max-w-7xl max-h-[90vh]">
                        <img
                            src={refund.reference_image_url}
                            alt="Refund reference full size"
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

            {/* QR Code Modal */}
            {qrModalOpen && refund.refund_account?.qr_code_url && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setQrModalOpen(false)}
                >
                    <div className="relative max-w-2xl">
                        <Card className="p-6">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">
                                    {refund.refund_account.account_name} - QR Code
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <img
                                    src={refund.refund_account.qr_code_url}
                                    alt="Refund account QR code"
                                    className="w-64 h-64 object-contain rounded border"
                                />
                                {refund.refund_account.account_number && (
                                    <p className="text-sm text-muted-foreground mt-4">
                                        {refund.refund_account.account_number}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setQrModalOpen(false)}
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
            { title: 'Refunds', href: '/refunds' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
