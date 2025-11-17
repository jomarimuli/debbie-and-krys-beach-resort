// resources/js/pages/rebooking/index.tsx

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type RebookingIndexProps, type Rebooking } from '@/types';
import { Link } from '@inertiajs/react';
import { RefreshCw, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
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
import rebookings from '@/routes/rebookings';

export default function Index({ rebookings: rebookingData }: RebookingIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(rebookings.destroy.url({ rebooking: deleteId }), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Rebookings</h1>
                    <p className="text-sm text-muted-foreground">Manage booking modifications</p>
                </div>
            </div>

            {rebookingData.stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{rebookingData.stats.total_rebookings}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{rebookingData.stats.pending_rebookings}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Approved</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{rebookingData.stats.approved_rebookings}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{rebookingData.stats.completed_rebookings}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        All Rebookings ({rebookingData.total})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rebooking #</TableHead>
                                    <TableHead>Original Booking</TableHead>
                                    <TableHead>New Check In</TableHead>
                                    <TableHead>Guests</TableHead>
                                    <TableHead>Amount Diff</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead className="w-32 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rebookingData.data.map((rebooking: Rebooking) => (
                                    <TableRow key={rebooking.id}>
                                        <TableCell className="font-medium text-sm">
                                            {rebooking.rebooking_number}
                                        </TableCell>
                                        <TableCell>
                                            {rebooking.original_booking && (
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {rebooking.original_booking.booking_number}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {rebooking.original_booking.guest_name}
                                                    </p>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {format(new Date(rebooking.new_check_in_date), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-sm">{rebooking.new_total_guests}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className={`font-medium text-sm ${parseFloat(rebooking.amount_difference) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {parseFloat(rebooking.amount_difference) >= 0 ? '+' : ''}₱{parseFloat(rebooking.amount_difference).toLocaleString()}
                                                </p>
                                                {parseFloat(rebooking.rebooking_fee) > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Fee: ₱{parseFloat(rebooking.rebooking_fee).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(rebooking.status)}
                                        </TableCell>
                                        <TableCell>
                                            {getPaymentStatusBadge(rebooking.payment_status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link href={rebookings.show.url({ rebooking: rebooking.id })}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                                {rebooking.status === 'pending' && (
                                                    <Link href={rebookings.edit.url({ rebooking: rebooking.id })}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                )}
                                                {rebooking.status !== 'completed' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setDeleteId(rebooking.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {rebookingData.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <RefreshCw className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No rebookings found</h3>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete rebooking?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the rebooking request. This action cannot be undone.
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
            { title: 'Rebookings', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
