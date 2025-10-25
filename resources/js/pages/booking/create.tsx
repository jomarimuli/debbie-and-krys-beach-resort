import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Accommodation, type PageProps } from '@/types';
import { format } from 'date-fns';
import bookings from '@/routes/bookings';

interface AccommodationItem {
    accommodation_id: string;
    quantity: string;
    guests: string;
}

export default function Create({ accommodations }: PageProps & { accommodations: Accommodation[] }) {
    const { data, setData, post, processing, errors } = useForm({
        source: 'walkin' as 'guest' | 'registered' | 'walkin',
        booking_type: 'day_tour' as 'day_tour' | 'overnight',
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_address: '',
        check_in_date: format(new Date(), 'yyyy-MM-dd'),
        check_out_date: '',
        total_adults: '1',
        total_children: '0',
        notes: '',
        accommodations: [
            { accommodation_id: '', quantity: '1', guests: '1' }
        ] as AccommodationItem[],
    });

    const addAccommodation = () => {
        setData('accommodations', [
            ...data.accommodations,
            { accommodation_id: '', quantity: '1', guests: '1' }
        ]);
    };

    const removeAccommodation = (index: number) => {
        setData('accommodations', data.accommodations.filter((_, i) => i !== index));
    };

    const updateAccommodation = (index: number, field: keyof AccommodationItem, value: string) => {
        const updated = [...data.accommodations];
        updated[index] = { ...updated[index], [field]: value };
        setData('accommodations', updated);
    };

    const getAvailableRates = (accommodationId: string) => {
        const accommodation = accommodations.find(a => a.id.toString() === accommodationId);
        return accommodation?.rates?.filter(r => r.booking_type === data.booking_type && r.is_active) || [];
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(bookings.store.url());
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={bookings.index.url()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">New Booking</h1>
                    <p className="text-sm text-muted-foreground">Create a new reservation</p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Booking Type */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Booking Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="booking_type" className="text-sm cursor-text select-text">Type</Label>
                                <Select value={data.booking_type} onValueChange={(value: 'day_tour' | 'overnight') => setData('booking_type', value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="day_tour">Day Tour</SelectItem>
                                        <SelectItem value="overnight">Overnight</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.booking_type && <p className="text-xs text-destructive">{errors.booking_type}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="source" className="text-sm cursor-text select-text">Source</Label>
                                <Select value={data.source} onValueChange={(value: 'guest' | 'registered' | 'walkin') => setData('source', value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="walkin">Walk-in</SelectItem>
                                        <SelectItem value="guest">Guest Booking</SelectItem>
                                        <SelectItem value="registered">Registered User</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.source && <p className="text-xs text-destructive">{errors.source}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Guest Information */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Guest Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
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
                        </div>
                    </CardContent>
                </Card>

                {/* Dates & Guests */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Dates & Guests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
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

                            {data.booking_type === 'overnight' && (
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
                        </div>
                    </CardContent>
                </Card>

                {/* Accommodations */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">Accommodations</CardTitle>
                            <Button type="button" size="sm" variant="outline" onClick={addAccommodation}>
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.accommodations.map((item, index) => (
                            <div key={index} className="grid gap-3 md:grid-cols-4 p-3 border rounded">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-sm cursor-text select-text">Accommodation</Label>
                                    <Select
                                        value={item.accommodation_id}
                                        onValueChange={(value) => updateAccommodation(index, 'accommodation_id', value)}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accommodations.map((acc) => {
                                                const rates = getAvailableRates(acc.id.toString());
                                                const hasRate = rates.length > 0;
                                                return (
                                                    <SelectItem
                                                        key={acc.id}
                                                        value={acc.id.toString()}
                                                        disabled={!hasRate}
                                                    >
                                                        {acc.name} {!hasRate && '(No rate)'}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-sm cursor-text select-text">Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateAccommodation(index, 'quantity', e.target.value)}
                                        className="h-9"
                                    />
                                </div>

                                <div className="space-y-1.5 flex items-end gap-2">
                                    <div className="flex-1">
                                        <Label className="text-sm cursor-text select-text">Guests</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.guests}
                                            onChange={(e) => updateAccommodation(index, 'guests', e.target.value)}
                                            className="h-9"
                                        />
                                    </div>
                                    {data.accommodations.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={() => removeAccommodation(index)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {errors.accommodations && <p className="text-xs text-destructive">{errors.accommodations}</p>}
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={2}
                            className="resize-none"
                            placeholder="Requests or remarks..."
                        />
                        {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing} size="sm">
                        Create Booking
                    </Button>
                    <Link href={bookings.index.url()}>
                        <Button type="button" variant="outline" size="sm">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Bookings', href: '/bookings' },
            { title: 'Create', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
