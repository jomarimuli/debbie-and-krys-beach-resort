// resources/js/pages/booking/index.tsx - Update the canEditBooking function

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BookingIndexProps, type Booking } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Ticket, Eye, Edit, Trash2 } from 'lucide-react';
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
import bookings from '@/routes/bookings';
import { useAuth } from '@/hooks/use-auth';

export default function Index({ bookings: bookingData }: BookingIndexProps) {
    const { can, user, isAdmin, isStaff, isCustomer } = useAuth();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(bookings.destroy.url({ booking: deleteId }), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

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

    // Updated permission check - customer can only edit pending bookings they own
    const canEditBooking = (booking: Booking) => {
        if (!can('booking edit')) {
            return false;
        }

        if (isAdmin() || isStaff()) {
            return true;
        }

        if (isCustomer()) {
            // Handle both number and object cases
            const bookingUserId = typeof booking.created_by === 'object'
                ? (booking.created_by as any)?.id
                : booking.created_by;

            return bookingUserId === user?.id && booking.status === 'pending';
        }

        return false;
    };

    const canDeleteBooking = (booking: Booking) => {
        if (!can('booking delete')) return false;

        // Only admin can delete
        return isAdmin();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Bookings</h1>
                    <p className="text-sm text-muted-foreground">Manage guest reservations</p>
                </div>
                {can('booking create') && (
                    <Link href={bookings.create.url()}>
                        <Button size="sm">
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            New Booking
                        </Button>
                    </Link>
                )}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        All Bookings ({bookingData.total})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking #</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Guest</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookingData.data.map((booking: Booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium text-sm">
                                        {booking.booking_number}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {booking.booking_code}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">{booking.guest_name}</p>
                                            {booking.guest_phone && (
                                                <p className="text-xs text-muted-foreground">{booking.guest_phone}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-xs">
                                            {booking.booking_type.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">{booking.total_guests}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">₱{parseFloat(booking.total_amount).toLocaleString()}</p>
                                            {booking.down_payment_required && (
                                                <p className="text-xs text-blue-600">
                                                    DP: ₱{parseFloat(booking.down_payment_amount || '0').toLocaleString()}
                                                </p>
                                            )}
                                            {parseFloat(booking.balance) > 0 && (
                                                <p className="text-xs text-muted-foreground">
                                                    Bal: ₱{parseFloat(booking.balance).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {getStatusBadge(booking.status)}
                                            {booking.rebookings && booking.rebookings.length > 0 && (
                                                <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                                                    Rebooking
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {can('booking show') && (
                                                <Link href={bookings.show.url({ booking: booking.id })}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            )}

                                            {canEditBooking(booking) && (
                                                <Link href={bookings.edit.url({ booking: booking.id })}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            )}

                                            {canDeleteBooking(booking) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setDeleteId(booking.id)}
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

                    {bookingData.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Ticket className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No bookings found</h3>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete booking?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the booking and all related data. This action cannot be undone.
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
            { title: 'Bookings', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
