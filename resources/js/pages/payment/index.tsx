import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Banknote, Eye, Edit, Trash2, ImageIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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

interface Payment {
    id: number;
    payment_number: string;
    booking_id: number;
    amount: string;
    payment_method: string;
    reference_number: string | null;
    reference_image: string | null;
    payment_date: string;
    booking?: {
        booking_number: string;
        guest_name: string;
    };
}

interface PaymentIndexProps extends PageProps {
    payments: {
        data: Payment[];
        total: number;
    };
}

export default function Index({ payments }: PaymentIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/payments/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const getPaymentMethodBadge = (method: string) => {
        return (
            <Badge variant="outline" className="capitalize">
                {method.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground">Manage booking payments</p>
                </div>
                <Link href="/payments/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Record Payment
                    </Button>
                </Link>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>All Payments</CardTitle>
                    <CardDescription>
                        Total: {payments.total} payments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment #</TableHead>
                                <TableHead>Booking #</TableHead>
                                <TableHead>Guest</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.data.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {payment.payment_number}
                                            {payment.reference_image && (
                                                <span title="Has reference image">
                                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/bookings/${payment.booking_id}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {payment.booking?.booking_number}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{payment.booking?.guest_name}</TableCell>
                                    <TableCell className="font-medium">
                                        ₱{parseFloat(payment.amount).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {getPaymentMethodBadge(payment.payment_method)}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/payments/${payment.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/payments/${payment.id}/edit`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(payment.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {payments.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Banknote className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No payments found</h3>
                            <p className="text-muted-foreground">Record your first payment to get started.</p>
                            <Link href="/payments/create" className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Record Payment
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the payment record and any associated reference image.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Payments', href: '#' },
        ]}
    >
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {page}
        </div>
    </AppLayout>
);
