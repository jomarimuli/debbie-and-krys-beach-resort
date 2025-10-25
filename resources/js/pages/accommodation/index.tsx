import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type AccommodationIndexProps, type Accommodation } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Hotel, Edit, Trash2, Eye } from 'lucide-react';
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
import * as accommodations from '@/routes/accommodations';

export default function Index({ accommodations: accommodationData }: AccommodationIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(accommodations.destroy.url({ accommodation: deleteId }), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Accommodations</h1>
                    <p className="text-sm text-muted-foreground">Manage rooms and cottages</p>
                </div>
                <Link href={accommodations.create.url()}>
                    <Button size="sm">
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        All Accommodations ({accommodationData.total})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accommodationData.data.map((accommodation: Accommodation) => (
                                <TableRow key={accommodation.id}>
                                    <TableCell>
                                        {accommodation.first_image_url ? (
                                            <img
                                                src={accommodation.first_image_url}
                                                alt={accommodation.name}
                                                className="w-14 h-14 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-muted rounded flex items-center justify-center">
                                                <Hotel className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <span>{accommodation.name}</span>
                                            {accommodation.is_air_conditioned && (
                                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                                    A/C
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-xs">
                                            {accommodation.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-xs">
                                            {accommodation.size}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {accommodation.min_capacity && accommodation.max_capacity
                                            ? `${accommodation.min_capacity}-${accommodation.max_capacity} pax`
                                            : accommodation.min_capacity
                                                ? `${accommodation.min_capacity}+ pax`
                                                : 'Flexible'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={accommodation.is_active ? 'default' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {accommodation.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={accommodations.show.url({ accommodation: accommodation.id })}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Link href={accommodations.edit.url({ accommodation: accommodation.id })}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setDeleteId(accommodation.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {accommodationData.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Hotel className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No accommodations found</h3>
                            <p className="text-sm text-muted-foreground mb-4">Get started by adding your first accommodation.</p>
                            <Link href={accommodations.create.url()}>
                                <Button size="sm">
                                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                                    Add Accommodation
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete accommodation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the accommodation and all its images. This action cannot be undone.
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
            { title: 'Accommodations', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
