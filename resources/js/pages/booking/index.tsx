// resources/js/pages/booking/index.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BookingIndexProps } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Home, Eye, Edit, Trash2 } from 'lucide-react';
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

export default function Index({ bookings }: BookingIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/bookings/${deleteId}`, {
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
            <Badge variant={variants[status] || 'outline'} className="capitalize">
                {status.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
                    <p className="text-muted-foreground">Manage guest reservations</p>
                </div>
                <Link href="/bookings/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Booking
                    </Button>
                </Link>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>
                        Total: {bookings.total} bookings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking #</TableHead>
                                <TableHead>Guest</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Guests</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.data.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">
                                        {booking.booking_number}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{booking.guest_name}</p>
                                            <p className="text-sm text-muted-foreground">{booking.guest_phone}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {booking.booking_type.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{booking.total_guests}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">₱{parseFloat(booking.total_amount).toLocaleString()}</p>
                                            {parseFloat(booking.balance) > 0 && (
                                                <p className="text-sm text-muted-foreground">
                                                    Balance: ₱{parseFloat(booking.balance).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(booking.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/bookings/${booking.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/bookings/${booking.id}/edit`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(booking.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {bookings.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Home className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No bookings found</h3>
                            <p className="text-muted-foreground">Create your first booking to get started.</p>
                            <Link href="/bookings/create" className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Booking
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
                            This action cannot be undone. This will permanently delete the booking and all related data.
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
            { title: 'Bookings', href: '/bookings' },
        ]}
    >
        {page}
    </AppLayout>
);
