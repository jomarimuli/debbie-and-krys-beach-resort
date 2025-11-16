import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type FeedbackIndexProps, type Feedback } from '@/types';
import { Link } from '@inertiajs/react';
import { Plus, MessageSquare, Eye, Edit, Trash2, Star, CheckCircle, XCircle } from 'lucide-react';
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
import feedbacks from '@/routes/feedbacks';

import { useAuth } from '@/hooks/use-auth';

export default function Index({ feedbacks: feedbackData }: FeedbackIndexProps) {
    const { can, user, isAdmin, isStaff } = useAuth();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(feedbacks.destroy.url({ feedback: deleteId }), {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    const handleApprove = (id: number) => {
        router.post(feedbacks.approve.url({ feedback: id }));
    };

    const handleReject = (id: number) => {
        router.post(feedbacks.reject.url({ feedback: id }));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'secondary'} className="capitalize text-xs">
                {status}
            </Badge>
        );
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                    />
                ))}
            </div>
        );
    };

    // Permission check helper for feedback ownership
    const canEditFeedback = (feedback: Feedback) => {
        if (!can('feedback edit')) return false;
        if (isAdmin() || isStaff()) return true;
        // Check if customer owns the feedback's booking
        return feedback.booking?.created_by === user?.id;
    };

    const canDeleteFeedback = (feedback: Feedback) => {
        if (!can('feedback delete')) return false;
        if (isAdmin() || isStaff()) return true;
        // Check if customer owns the feedback's booking
        return feedback.booking?.created_by === user?.id;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Feedbacks</h1>
                    <p className="text-sm text-muted-foreground">Manage guest reviews and ratings</p>
                </div>
                {/* Everyone can create feedback */}
                {can('feedback create') && (
                    <Link href={feedbacks.create.url()}>
                        <Button size="sm">
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Add Feedback
                        </Button>
                    </Link>
                )}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">
                        All Feedbacks ({feedbackData.total})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Guest</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Comment</TableHead>
                                <TableHead>Booking</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-32 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feedbackData.data.map((feedback: Feedback) => (
                                <TableRow key={feedback.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-sm">{feedback.guest_name}</p>
                                            {feedback.guest_phone && (
                                                <p className="text-xs text-muted-foreground">{feedback.guest_phone}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            {renderStars(feedback.rating)}
                                            <span className="text-xs text-muted-foreground">({feedback.rating})</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <p className="text-sm line-clamp-2">
                                            {feedback.comment || <span className="text-muted-foreground">No comment</span>}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {feedback.booking ? (
                                            <Link
                                                href={`/bookings/${feedback.booking_id}`}
                                                className="text-primary hover:underline"
                                            >
                                                {feedback.booking.booking_number}
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">Walk-in</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(feedback.created_at), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {/* Only admin/staff can approve/reject */}
                                            {feedback.status === 'pending' && (isAdmin() || isStaff()) && can('feedback approve') && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-600"
                                                        onClick={() => handleApprove(feedback.id)}
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600"
                                                        onClick={() => handleReject(feedback.id)}
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" />
                                                    </Button>
                                                </>
                                            )}

                                            {/* Everyone can view their own feedback */}
                                            {can('feedback show') && (
                                                <Link href={feedbacks.show.url({ feedback: feedback.id })}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            )}

                                            {/* Check edit permission with ownership */}
                                            {canEditFeedback(feedback) && (
                                                <Link href={feedbacks.edit.url({ feedback: feedback.id })}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                            )}

                                            {/* Check delete permission with ownership */}
                                            {canDeleteFeedback(feedback) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setDeleteId(feedback.id)}
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

                    {feedbackData.data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-base font-medium mb-1">No feedbacks found</h3>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this feedback. This action cannot be undone.
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
            { title: 'Feedbacks', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
