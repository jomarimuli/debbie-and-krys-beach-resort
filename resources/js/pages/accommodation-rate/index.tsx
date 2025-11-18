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
import { useAuth } from '@/hooks/use-auth';

export default function Index({ rates }: AccommodationRateIndexProps) {
    const { can, isAdmin, isStaff } = useAuth();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(accommodationRates.destroy.url({ accommodation_rate: deleteId }), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const getTypeLabel = (type: string) => {
        return type === 'room' ? 'Room' : 'Cottage';
    };

    const getSizeLabel = (size: string) => {
        return size === 'small' ? 'Small' : 'Big';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Rates</h1>
                    <p className="text-sm text-muted-foreground">Manage pricing for rooms and cottages</p>
                </div>
                {/* Only admin/staff can create */}
                {(isAdmin() || isStaff()) && can('accommodation-rate create') && (
                    <Link href={accommodationRates.create.url()}>
                        <Button size="sm">
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Add Rate
                        </Button>
                    </Link>
                )}
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
                                <TableHead>Entrance Fees</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rates.data.map((rate: AccommodationRate) => (
                                <TableRow key={rate.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">{rate.accommodation?.name}</p>
                                            <div className="flex gap-1 mt-0.5">
                                                <Badge variant="outline" className="text-xs">
                                                    {getTypeLabel(rate.accommodation?.type || '')}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {getSizeLabel(rate.accommodation?.size || '')}
                                                </Badge>
                                                {rate.accommodation?.is_air_conditioned && (
                                                    <Badge variant="outline" className="text-xs">
                                                        AC
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="text-xs capitalize w-fit">
                                                {rate.booking_type.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {rate.booking_type === 'overnight' ? '22 hrs' : '8 hrs'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">
                                        ₱{parseFloat(rate.rate).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {rate.additional_pax_rate
                                            ? `₱${parseFloat(rate.additional_pax_rate).toLocaleString()}`
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs space-y-0.5">
                                            <p>Adult: ₱{parseFloat(rate.adult_entrance_fee || '0').toLocaleString()}</p>
                                            <p>Child: ₱{parseFloat(rate.child_entrance_fee || '0').toLocaleString()}</p>
                                            {rate.includes_free_entrance && (
                                                <Badge variant="secondary" className="text-xs mt-1">
                                                    Free entrance
                                                </Badge>
                                            )}
                                        </div>
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
                                            {/* Everyone can view */}
                                            {can('accommodation-rate show') && (
                                                <Link href={accommodationRates.show.url({ accommodation_rate: rate.id })}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            )}

                                            {/* Only admin/staff can edit */}
                                            {(isAdmin() || isStaff()) && can('accommodation-rate edit') && (
                                                <Link href={accommodationRates.edit.url({ accommodation_rate: rate.id })}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            )}

                                            {/* Only admin/staff can delete */}
                                            {(isAdmin() || isStaff()) && can('accommodation-rate delete') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setDeleteId(rate.id)}
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

                    {rates.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Coins className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No rates found</h3>
                            <p className="text-sm text-muted-foreground">Get started by adding your first rate</p>
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
