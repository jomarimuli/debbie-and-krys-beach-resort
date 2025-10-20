import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type AccommodationIndexProps } from '@/types';
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

export default function Index({ accommodations }: AccommodationIndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/accommodations/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Accommodations</h1>
                    <p className="text-muted-foreground">Manage rooms and cottages</p>
                </div>
                <Link href="/accommodations/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Accommodation
                    </Button>
                </Link>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>All Accommodations</CardTitle>
                    <CardDescription>
                        Total: {accommodations.total} accommodations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Available</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accommodations.data.map((accommodation) => (
                                <TableRow key={accommodation.id}>
                                    <TableCell>
                                        {accommodation.first_image_url ? (
                                            <img
                                                src={accommodation.first_image_url}
                                                alt={accommodation.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                                <Hotel className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {accommodation.name}
                                            {accommodation.is_air_conditioned && (
                                                <Badge variant="secondary" className="text-xs">
                                                    A/C
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {accommodation.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {accommodation.min_capacity && accommodation.max_capacity
                                            ? `${accommodation.min_capacity}-${accommodation.max_capacity} pax`
                                            : accommodation.min_capacity
                                                ? `${accommodation.min_capacity}+ pax`
                                                : 'Flexible'}
                                    </TableCell>
                                    <TableCell>{accommodation.quantity_available}</TableCell>
                                    <TableCell>
                                        <Badge variant={accommodation.is_active ? 'default' : 'secondary'}>
                                            {accommodation.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/accommodations/${accommodation.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/accommodations/${accommodation.id}/edit`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(accommodation.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {accommodations.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Hotel className="h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No accommodations found</h3>
                            <p className="text-muted-foreground">Get started by adding your first accommodation.</p>
                            <Link href="/accommodations/create" className="mt-4">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
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
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the accommodation and all its images.
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
            { title: 'Accommodations', href: '#' },
        ]}
    >
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {page}
        </div>
    </AppLayout>
);
