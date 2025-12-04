import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type GalleryIndexProps, type Gallery } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Image as ImageIcon, Eye, Edit, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
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
import galleries from '@/routes/galleries';

import { useAuth } from '@/hooks/use-auth';

export default function Index({ galleries: galleryData }: GalleryIndexProps) {
    const { can, isAdmin, isStaff } = useAuth();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

    const handleDelete = () => {
        if (deleteId) {
            router.delete(galleries.destroy.url({ gallery: deleteId }), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const handleImageError = (galleryId: number) => {
        setImageErrors(prev => new Set(prev).add(galleryId));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Gallery</h1>
                    <p className="text-sm text-muted-foreground">Manage resort images</p>
                </div>
                {/* Only admin/staff can create */}
                {(isAdmin() || isStaff()) && can('gallery create') && (
                    <Link href={galleries.create.url()}>
                        <Button size="sm">
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Add Image
                        </Button>
                    </Link>
                )}
            </div>

            {galleryData.data.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-3" />
                        <h3 className="text-base font-medium mb-1">No images found</h3>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {galleryData.data.map((gallery: Gallery) => (
                        <Card key={gallery.id} className="overflow-hidden group">
                            <div className="relative aspect-square overflow-hidden bg-muted">
                                {gallery.image_url && !imageErrors.has(gallery.id) ? (
                                    <img
                                        src={gallery.image_url}
                                        alt={gallery.title}
                                        className="w-full h-full object-cover"
                                        onError={() => handleImageError(gallery.id)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                                    {/* Everyone can view */}
                                    {can('gallery show') && (
                                        <Link href={galleries.show.url({ gallery: gallery.id })}>
                                            <Button variant="secondary" size="icon" className="h-8 w-8">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}

                                    {/* Only admin/staff can edit */}
                                    {(isAdmin() || isStaff()) && can('gallery edit') && (
                                        <Link href={galleries.edit.url({ gallery: gallery.id })}>
                                            <Button variant="secondary" size="icon" className="h-8 w-8">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}

                                    {/* Only admin/staff can delete */}
                                    {(isAdmin() || isStaff()) && can('gallery delete') && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setDeleteId(gallery.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                {!gallery.is_active && (
                                    <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                                        Inactive
                                    </Badge>
                                )}
                            </div>
                            <CardContent className="p-3">
                                <h3 className="font-medium text-sm line-clamp-1">{gallery.title}</h3>
                                {gallery.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                        {gallery.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                        Order: {gallery.sort_order}
                                    </span>
                                    <Badge variant={gallery.is_active ? 'default' : 'secondary'} className="text-xs">
                                        {gallery.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete image?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this gallery image. This action cannot be undone.
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
            { title: 'Gallery', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
