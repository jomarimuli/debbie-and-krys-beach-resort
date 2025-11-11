import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type PaymentIndexProps, type Payment } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Banknote, Eye, Edit, Trash2, ImageIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import payments from '@/routes/payments';
import bookings from '@/routes/bookings';

export default function Index({ payments: paymentData }: PaymentIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(payments.destroy.url({ payment: deleteId }), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const getPaymentMethodBadge = (method: string) => {
        const colors: Record<string, string> = {
            cash: 'bg-green-100 text-green-800',
            card: 'bg-blue-100 text-blue-800',
            bank: 'bg-purple-100 text-purple-800',
            gcash: 'bg-teal-100 text-teal-800',
            maya: 'bg-orange-100 text-orange-800',
            other: 'bg-gray-100 text-gray-800',
        };

        return (
            <Badge variant="outline" className={`capitalize text-xs ${colors[method] || ''}`}>
                {method.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Payments</h1>
                    <p className="text-sm text-muted-foreground">Manage booking payments</p>
                </div>
                <Link href={payments.create.url()}>
                    <Button size="sm">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Record Payment
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        All Payments ({paymentData.total})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment #</TableHead>
                                <TableHead>Booking #</TableHead>
                                <TableHead>Guest</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentData.data.map((payment: Payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <span>{payment.payment_number}</span>
                                            {payment.reference_image && (
                                                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={bookings.show.url({ booking: payment.booking_id })}
                                            className="text-primary hover:underline text-sm"
                                        >
                                            {payment.booking?.booking_number}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-sm">{payment.booking?.guest_name}</TableCell>
                                    <TableCell className="font-medium text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span>₱{parseFloat(payment.amount).toLocaleString()}</span>
                                            {payment.is_down_payment && (
                                                <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                                                    DP
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getPaymentMethodBadge(payment.payment_method)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {payment.payment_account ? (
                                            <div className="text-xs">
                                                <div className="font-medium">{payment.payment_account.account_name}</div>
                                                {payment.payment_account.account_number && (
                                                    <div className="text-muted-foreground">{payment.payment_account.account_number}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={payments.show.url({ payment: payment.id })}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Link href={payments.edit.url({ payment: payment.id })}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setDeleteId(payment.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {paymentData.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Banknote className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No payments found</h3>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete payment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the payment record and any associated reference image. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Payments', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
