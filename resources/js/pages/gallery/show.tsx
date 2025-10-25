import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Gallery, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';
import galleries from '@/routes/galleries';

export default function Show({ gallery }: PageProps & { gallery: Gallery }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={galleries.index.url()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{gallery.title}</h1>
                        <p className="text-sm text-muted-foreground">Gallery image details</p>
                    </div>
                </div>
                <Link href={galleries.edit.url({ gallery: gallery.id })}>
                    <Button size="sm" variant="outline">
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Image */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <img
                            src={gallery.image_url}
                            alt={gallery.title}
                            className="w-full aspect-square object-cover rounded border"
                        />
                    </CardContent>
                </Card>

                {/* Details */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Title</p>
                            <p className="text-sm font-medium">{gallery.title}</p>
                        </div>

                        {gallery.description && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Description</p>
                                <p className="text-sm text-muted-foreground">{gallery.description}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Sort Order</p>
                            <p className="text-sm font-medium">{gallery.sort_order}</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                            <Badge variant={gallery.is_active ? 'default' : 'secondary'} className="text-xs">
                                {gallery.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Created</p>
                            <p className="text-sm font-medium">
                                {format(new Date(gallery.created_at), 'MMMM dd, yyyy HH:mm')}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Last Updated</p>
                            <p className="text-sm font-medium">
                                {format(new Date(gallery.updated_at), 'MMMM dd, yyyy HH:mm')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Gallery', href: '/galleries' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
