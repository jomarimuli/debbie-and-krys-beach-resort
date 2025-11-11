// resources/js/pages/refund/index.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type RefundIndexProps, type Refund } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, ReceiptText, Eye, Edit, Trash2, ImageIcon } from 'lucide-react';
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
import refunds from '@/routes/refunds';
import payments from '@/routes/payments';

export default function Index({ refunds: refundData }: RefundIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(refunds.destroy.url({ refund: deleteId }), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const getRefundMethodBadge = (method: string) => {
        const colors: Record<string, string> = {
            cash: 'bg-green-100 text-green-800',
            card: 'bg-blue-100 text-blue-800',
            bank: 'bg-purple-100 text-purple-800',
            gcash: 'bg-teal-100 text-teal-800',
            maya: 'bg-orange-100 text-orange-800',
            original_method: 'bg-indigo-100 text-indigo-800',
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
                    <h1 className="text-xl font-semibold">Refunds</h1>
                    <p className="text-sm text-muted-foreground">Manage payment refunds</p>
                </div>
                <Link href={refunds.create.url()}>
                    <Button size="sm">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Process Refund
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        All Refunds ({refundData.total})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Refund #</TableHead>
                                <TableHead>Payment #</TableHead>
                                <TableHead>Guest</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {refundData.data.map((refund: Refund) => (
                                <TableRow key={refund.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <span>{refund.refund_number}</span>
                                            {refund.reference_image && (
                                                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={payments.show.url({ payment: refund.payment_id })}
                                            className="text-primary hover:underline text-sm"
                                        >
                                            {refund.payment?.payment_number}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {refund.payment?.booking?.guest_name}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm text-red-600">
                                        -₱{parseFloat(refund.amount).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {getRefundMethodBadge(refund.refund_method)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(refund.refund_date), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={refunds.show.url({ refund: refund.id })}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Link href={refunds.edit.url({ refund: refund.id })}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setDeleteId(refund.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {refundData.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <ReceiptText className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No refunds found</h3>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete refund?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the refund record. This action cannot be undone.
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
            { title: 'Refunds', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
