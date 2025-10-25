import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Booking, type PageProps } from '@/types';
import { format } from 'date-fns';
import bookings from '@/routes/bookings';

export default function Edit({ booking }: PageProps & { booking: Booking }) {
    const { data, setData, put, processing, errors } = useForm({
        guest_name: booking.guest_name,
        guest_email: booking.guest_email || '',
        guest_phone: booking.guest_phone || '',
        guest_address: booking.guest_address || '',
        check_in_date: format(new Date(booking.check_in_date), 'yyyy-MM-dd'),
        check_out_date: booking.check_out_date ? format(new Date(booking.check_out_date), 'yyyy-MM-dd') : '',
        total_adults: booking.total_adults.toString(),
        total_children: booking.total_children.toString(),
        notes: booking.notes || '',
        status: booking.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(bookings.update.url({ booking: booking.id }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={bookings.show.url({ booking: booking.id })}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">Edit Booking</h1>
                    <p className="text-sm text-muted-foreground">{booking.booking_number}</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Booking Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="guest_name" className="text-sm cursor-text select-text">Guest Name</Label>
                                <Input
                                    id="guest_name"
                                    value={data.guest_name}
                                    onChange={(e) => setData('guest_name', e.target.value)}
                                    className="h-9"
                                />
                                {errors.guest_name && <p className="text-xs text-destructive">{errors.guest_name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="guest_phone" className="text-sm cursor-text select-text">Phone Number</Label>
                                <Input
                                    id="guest_phone"
                                    value={data.guest_phone}
                                    onChange={(e) => setData('guest_phone', e.target.value)}
                                    className="h-9"
                                />
                                {errors.guest_phone && <p className="text-xs text-destructive">{errors.guest_phone}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="guest_email" className="text-sm cursor-text select-text">Email</Label>
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
                                <Label htmlFor="guest_address" className="text-sm cursor-text select-text">Address</Label>
                                <Input
                                    id="guest_address"
                                    value={data.guest_address}
                                    onChange={(e) => setData('guest_address', e.target.value)}
                                    className="h-9"
                                />
                                {errors.guest_address && <p className="text-xs text-destructive">{errors.guest_address}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="check_in_date" className="text-sm cursor-text select-text">Check-in Date</Label>
                                <Input
                                    id="check_in_date"
                                    type="date"
                                    value={data.check_in_date}
                                    onChange={(e) => setData('check_in_date', e.target.value)}
                                    className="h-9"
                                />
                                {errors.check_in_date && <p className="text-xs text-destructive">{errors.check_in_date}</p>}
                            </div>

                            {booking.booking_type === 'overnight' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="check_out_date" className="text-sm cursor-text select-text">Check-out Date</Label>
                                    <Input
                                        id="check_out_date"
                                        type="date"
                                        value={data.check_out_date}
                                        onChange={(e) => setData('check_out_date', e.target.value)}
                                        className="h-9"
                                    />
                                    {errors.check_out_date && <p className="text-xs text-destructive">{errors.check_out_date}</p>}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="total_adults" className="text-sm cursor-text select-text">Adults</Label>
                                <Input
                                    id="total_adults"
                                    type="number"
                                    min="1"
                                    value={data.total_adults}
                                    onChange={(e) => setData('total_adults', e.target.value)}
                                    className="h-9"
                                />
                                {errors.total_adults && <p className="text-xs text-destructive">{errors.total_adults}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="total_children" className="text-sm cursor-text select-text">Children</Label>
                                <Input
                                    id="total_children"
                                    type="number"
                                    min="0"
                                    value={data.total_children}
                                    onChange={(e) => setData('total_children', e.target.value)}
                                    className="h-9"
                                />
                                {errors.total_children && <p className="text-xs text-destructive">{errors.total_children}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="status" className="text-sm cursor-text select-text">Status</Label>
                                <Select value={data.status} onValueChange={(value: any) => setData('status', value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="checked_in">Checked In</SelectItem>
                                        <SelectItem value="checked_out">Checked Out</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="notes" className="text-sm cursor-text select-text">Notes</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={2}
                                className="resize-none"
                            />
                            {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={processing} size="sm">
                                Update Booking
                            </Button>
                            <Link href={bookings.show.url({ booking: booking.id })}>
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
            { title: 'Bookings', href: '/bookings' },
            { title: 'Edit', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
