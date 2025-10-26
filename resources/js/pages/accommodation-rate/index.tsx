import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type AccommodationRateIndexProps, type AccommodationRate } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Coins, Eye, Edit, Trash2 } from 'lucide-react';
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
import accommodationRates from '@/routes/accommodation-rates';

export default function Index({ rates }: AccommodationRateIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(accommodationRates.destroy.url({ accommodation_rate: deleteId }), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Rates</h1>
                    <p className="text-sm text-muted-foreground">Manage pricing for rooms and cottages</p>
                </div>
                <Link href={accommodationRates.create.url()}>
                    <Button size="sm">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add Rate
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        All Rates ({rates.total})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Accommodation</TableHead>
                                <TableHead>Booking Type</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Additional Pax</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rates.data.map((rate: AccommodationRate) => (
                                <TableRow key={rate.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <span>{rate.accommodation?.name}</span>
                                            {rate.accommodation?.is_air_conditioned && (
                                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                                    A/C
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-xs">
                                            {rate.booking_type.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">
                                        ₱{parseFloat(rate.rate).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {rate.additional_pax_rate
                                            ? `₱${parseFloat(rate.additional_pax_rate).toLocaleString()}`
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={rate.is_active ? 'default' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {rate.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={accommodationRates.show.url({ accommodation_rate: rate.id })}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Link href={accommodationRates.edit.url({ accommodation_rate: rate.id })}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setDeleteId(rate.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {rates.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Coins className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No rates found</h3>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete rate?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the rate. This action cannot be undone.
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
            { title: 'Rates', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
