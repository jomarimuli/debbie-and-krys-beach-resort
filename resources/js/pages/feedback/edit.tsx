import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, LoaderCircle, Star } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Feedback, type Booking, type PageProps } from '@/types';
import feedbacks from '@/routes/feedbacks';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export default function Edit({
    feedback,
    bookings,
}: PageProps & {
    feedback: Feedback;
    bookings: Booking[];
}) {
    const { isCustomer } = useAuth();
    const { data, setData, put, processing, errors } = useForm({
        booking_id: feedback.booking_id?.toString() || '',
        guest_name: feedback.guest_name,
        guest_email: feedback.guest_email || '',
        guest_phone: feedback.guest_phone || '',
        guest_address: feedback.guest_address || '',
        rating: feedback.rating,
        comment: feedback.comment || '',
        status: feedback.status,
    });

    const selectedBooking = bookings.find((b) => b.id === parseInt(data.booking_id));

    const handleBookingChange = (value: string) => {
        setData('booking_id', value);
        const booking = bookings.find((b) => b.id === parseInt(value));
        if (booking) {
            setData((prev) => ({
                ...prev,
                booking_id: value,
                guest_name: booking.guest_name,
                guest_email: booking.guest_email || '',
                guest_phone: booking.guest_phone || '',
                guest_address: booking.guest_address || '',
            }));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(feedbacks.update.url({ feedback: feedback.id }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={feedbacks.show.url({ feedback: feedback.id })}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">Edit Feedback</h1>
                    <p className="text-sm text-muted-foreground">{feedback.guest_name}</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Feedback Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="booking_id" className="text-sm cursor-text select-text">
                                Booking (Optional)
                            </Label>
                            <Select value={data.booking_id} onValueChange={handleBookingChange}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select or leave empty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No Booking (Walk-in)</SelectItem>
                                    {bookings.map((booking) => (
                                        <SelectItem key={booking.id} value={booking.id.toString()}>
                                            {booking.booking_number} - {booking.guest_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.booking_id && <p className="text-xs text-destructive">{errors.booking_id}</p>}
                        </div>

                        {selectedBooking && (
                            <div className="rounded border p-3 bg-muted/30 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Check-in:</span>
                                    <span className="font-medium">
                                        {new Date(selectedBooking.check_in_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Type:</span>
                                    <span className="font-medium capitalize">
                                        {selectedBooking.booking_type.replace('_', ' ')}
                                    </span>
                                </div>
                                {selectedBooking.accommodations && selectedBooking.accommodations.length > 0 && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Accommodations:</span>
                                        <ul className="mt-1 space-y-0.5">
                                            {selectedBooking.accommodations.map((acc) => (
                                                <li key={acc.id} className="ml-2 text-xs">
                                                    • {acc.accommodation?.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="guest_name" className="text-sm cursor-text select-text">
                                    Guest Name
                                </Label>
                                <Input
                                    id="guest_name"
                                    value={data.guest_name}
                                    onChange={(e) => setData('guest_name', e.target.value)}
                                    className="h-9"
                                />
                                {errors.guest_name && <p className="text-xs text-destructive">{errors.guest_name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="guest_phone" className="text-sm cursor-text select-text">
                                    Phone Number
                                </Label>
                                <Input
                                    id="guest_phone"
                                    value={data.guest_phone}
                                    onChange={(e) => setData('guest_phone', e.target.value)}
                                    className="h-9"
                                />
                                {errors.guest_phone && <p className="text-xs text-destructive">{errors.guest_phone}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="guest_email" className="text-sm cursor-text select-text">
                                    Email
                                </Label>
                                <Input
                                    id="guest_email"
                                    type="email"
                                    value={data.guest_email}
                                    onChange={(e) => setData('guest_email', e.target.value)}
                                    className="h-9"
                                />
                                {errors.guest_email && <p className="text-xs text-destructive">{errors.guest_email}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="guest_address" className="text-sm cursor-text select-text">
                                    Address
                                </Label>
                                <Input
                                    id="guest_address"
                                    value={data.guest_address}
                                    onChange={(e) => setData('guest_address', e.target.value)}
                                    className="h-9"
                                />
                                {errors.guest_address && <p className="text-xs text-destructive">{errors.guest_address}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm cursor-text select-text">Rating</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setData('rating', star)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={cn(
                                                'h-8 w-8',
                                                star <= data.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'fill-gray-200 text-gray-200'
                                            )}
                                        />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-muted-foreground self-center">
                                    {data.rating} / 5
                                </span>
                            </div>
                            {errors.rating && <p className="text-xs text-destructive">{errors.rating}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="comment" className="text-sm cursor-text select-text">
                                Comment
                            </Label>
                            <Textarea
                                id="comment"
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                            {errors.comment && <p className="text-xs text-destructive">{errors.comment}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="status" className="text-sm cursor-text select-text">
                                Status
                            </Label>
                            <Select
                                value={data.status}
                                onValueChange={(value: 'pending' | 'approved' | 'rejected') =>
                                    setData('status', value)
                                }
                                disabled={isCustomer()}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={processing} size="sm">
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Update Feedback
                            </Button>
                            <Link href={feedbacks.show.url({ feedback: feedback.id })}>
                                <Button type="button" variant="outline" size="sm">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Feedbacks', href: '/feedbacks' },
            { title: 'Edit', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
