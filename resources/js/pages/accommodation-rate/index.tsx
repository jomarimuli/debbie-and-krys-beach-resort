// resources/js/pages/accommodation-rate/index.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type PageProps, type AccommodationRate } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Coins, Eye, Edit, Trash2 } from 'lucide-react';
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

interface AccommodationRateIndexProps extends PageProps {
    rates: {
        data: AccommodationRate[];
        total: number;
    };
}

export default function Index({ rates }: AccommodationRateIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/accommodation-rates/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Accommodation Rates</h1>
                    <p className="text-muted-foreground">Manage pricing for rooms and cottages</p>
                </div>
                <Link href="/accommodation-rates/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Rate
                    </Button>
                </Link>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>All Rates</CardTitle>
                    <CardDescription>
                        Total: {rates.total} rates configured
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Accommodation</TableHead>
                                <TableHead>Booking Type</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Base Capacity</TableHead>
                                <TableHead>Additional Pax</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rates.data.map((rate) => (
                                <TableRow key={rate.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {rate.accommodation?.name}
                                            {rate.accommodation?.is_air_conditioned && (
                                                <Badge variant="secondary" className="text-xs">
                                                    A/C
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {rate.booking_type.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        ₱{parseFloat(rate.rate).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {rate.base_capacity ? `${rate.base_capacity} pax` : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {rate.additional_pax_rate
                                            ? `₱${parseFloat(rate.additional_pax_rate).toLocaleString()}`
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={rate.is_active ? 'default' : 'secondary'}>
                                            {rate.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/accommodation-rates/${rate.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/accommodation-rates/${rate.id}/edit`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(rate.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {rates.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Coins className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No rates found</h3>
                            <p className="text-muted-foreground">Add pricing rates for your accommodations.</p>
                            <Link href="/accommodation-rates/create" className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Rate
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
                            This action cannot be undone. This will permanently delete the rate.
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
            { title: 'Accommodation Rates', href: '#' },
        ]}
    >
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {page}
        </div>
    </AppLayout>
);
