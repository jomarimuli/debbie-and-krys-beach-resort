import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Feedback, type PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Star, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';
import feedbacks from '@/routes/feedbacks';
import bookings from '@/routes/bookings';

import { useAuth } from '@/hooks/use-auth';

export default function Show({ feedback }: PageProps & { feedback: Feedback }) {
    const { can, user, isAdmin, isStaff } = useAuth();

    const handleApprove = () => {
        router.post(feedbacks.approve.url({ feedback: feedback.id }));
    };

    const handleReject = () => {
        router.post(feedbacks.reject.url({ feedback: feedback.id }));
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
            <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`h-5 w-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                    />
                ))}
            </div>
        );
    };

    // Permission check helper for feedback ownership
    const isOwner = feedback.booking?.created_by === user?.id;
    const canEdit = (isAdmin() || isStaff() || isOwner) && can('feedback edit');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={feedbacks.index.url()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold">{feedback.guest_name}</h1>
                        <p className="text-sm text-muted-foreground">Feedback details</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Only admin/staff can approve/reject */}
                    {feedback.status === 'pending' && (isAdmin() || isStaff()) && can('feedback approve') && (
                        <>
                            <Button size="sm" onClick={handleApprove}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={handleReject}>
                                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                Reject
                            </Button>
                        </>
                    )}

                    {/* Check edit permission with ownership */}
                    {canEdit && (
                        <Link href={feedbacks.edit.url({ feedback: feedback.id })}>
                            <Button size="sm" variant="outline">
                                <Edit className="h-3.5 w-3.5 mr-1.5" />
                                Edit
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Guest Information */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Guest Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                            <p className="text-sm font-medium">{feedback.guest_name}</p>
                        </div>
                        {feedback.guest_phone && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                                <p className="text-sm font-medium">{feedback.guest_phone}</p>
                            </div>
                        )}
                        {feedback.guest_email && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                                <p className="text-sm font-medium">{feedback.guest_email}</p>
                            </div>
                        )}
                        {feedback.guest_address && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                                <p className="text-sm font-medium">{feedback.guest_address}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Rating & Status */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Rating & Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Rating</p>
                            <div className="flex items-center gap-2">
                                {renderStars(feedback.rating)}
                                <span className="text-sm font-medium">({feedback.rating}/5)</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                            {getStatusBadge(feedback.status)}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Submitted</p>
                            <p className="text-sm font-medium">
                                {format(new Date(feedback.created_at), 'MMMM dd, yyyy HH:mm')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Booking Reference */}
            {feedback.booking && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Booking Reference</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Booking Number</p>
                            <Link
                                href={bookings.show.url({ booking: feedback.booking_id! })}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                {feedback.booking.booking_number}
                            </Link>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Check-in Date</p>
                            <p className="text-sm font-medium">
                                {format(new Date(feedback.booking.check_in_date), 'MMMM dd, yyyy')}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Booking Type</p>
                            <Badge variant="outline" className="capitalize text-xs">
                                {feedback.booking.booking_type.replace('_', ' ')}
                            </Badge>
                        </div>
                        {feedback.booking.accommodations && feedback.booking.accommodations.length > 0 && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Accommodations</p>
                                <div className="space-y-1">
                                    {feedback.booking.accommodations.map((acc) => (
                                        <p key={acc.id} className="text-sm">
                                            • {acc.accommodation?.name}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Comment */}
            {feedback.comment && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Comment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feedback.comment}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Feedbacks', href: '/feedbacks' },
            { title: 'Show', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
