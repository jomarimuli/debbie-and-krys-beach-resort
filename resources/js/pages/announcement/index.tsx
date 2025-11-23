import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type AnnouncementIndexProps, type Announcement } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, Megaphone, Eye, Edit, Trash2 } from 'lucide-react';
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
import announcements from '@/routes/announcements';
import { useAuth } from '@/hooks/use-auth';

export default function Index({ announcements: announcementData }: AnnouncementIndexProps) {
    const { can, isAdmin, isStaff } = useAuth();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(announcements.destroy.url({ announcement: deleteId }), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    // Permission check helpers
    const canEditAnnouncement = () => {
        if (!can('announcement edit')) return false;
        return isAdmin() || isStaff();
    };

    const canDeleteAnnouncement = () => {
        if (!can('announcement delete')) return false;
        return isAdmin() || isStaff();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Announcements</h1>
                    <p className="text-sm text-muted-foreground">Manage resort announcements</p>
                </div>
                {can('announcement create') && (isAdmin() || isStaff()) && (
                    <Link href={announcements.create.url()}>
                        <Button size="sm">
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            New Announcement
                        </Button>
                    </Link>
                )}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        All Announcements ({announcementData.total})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Published</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {announcementData.data.map((announcement: Announcement) => (
                                <TableRow key={announcement.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">{announcement.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {announcement.content}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {announcement.published_at
                                            ? format(new Date(announcement.published_at), 'MMM dd, yyyy')
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {announcement.expires_at
                                            ? format(new Date(announcement.expires_at), 'MMM dd, yyyy')
                                            : 'No expiry'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={announcement.is_active ? 'default' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {announcement.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {can('announcement show') && (
                                                <Link href={announcements.show.url({ announcement: announcement.id })}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            )}

                                            {canEditAnnouncement() && (
                                                <Link href={announcements.edit.url({ announcement: announcement.id })}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            )}

                                            {canDeleteAnnouncement() && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setDeleteId(announcement.id)}
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

                    {announcementData.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Megaphone className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No announcements found</h3>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this announcement. This action cannot be undone.
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
            { title: 'Announcements', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
