// resources/js/pages/booking/create.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Accommodation, type PageProps } from '@/types';

export default function Create({ accommodations }: PageProps & { accommodations: Accommodation[] }) {
    const { data, setData, post, processing, errors } = useForm({
        source: 'walkin' as 'guest' | 'registered' | 'walkin',
        booking_type: 'day_tour' as 'day_tour' | 'overnight',
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_address: '',
        check_in_date: '',
        check_out_date: '',
        total_adults: '1',
        total_children: '0',
        notes: '',
        accommodations: [] as { accommodation_id: number; quantity: number; guests: number }[],
    });

    const addAccommodation = () => {
        setData('accommodations', [
            ...data.accommodations,
            { accommodation_id: 0, quantity: 1, guests: 1 },
        ]);
    };

    const removeAccommodation = (index: number) => {
        setData('accommodations', data.accommodations.filter((_, i) => i !== index));
    };

    const updateAccommodation = (index: number, field: string, value: any) => {
        const updated = [...data.accommodations];
        updated[index] = { ...updated[index], [field]: value };
        setData('accommodations', updated);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/bookings');
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <Link href="/bookings">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Booking</h1>
                    <p className="text-muted-foreground">Add a new guest reservation</p>
                </div>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Information</CardTitle>
                        <CardDescription>Basic booking details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="source">Booking Source *</Label>
                                <Select value={data.source} onValueChange={(value: any) => setData('source', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="guest">Guest Booking</SelectItem>
                                        <SelectItem value="registered">Registered User</SelectItem>
                                        <SelectItem value="walkin">Walk-in</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.source && <p className="text-sm text-destructive">{errors.source}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="booking_type">Booking Type *</Label>
                                <Select value={data.booking_type} onValueChange={(value: any) => setData('booking_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="day_tour">Day Tour</SelectItem>
                                        <SelectItem value="overnight">Overnight</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.booking_type && <p className="text-sm text-destructive">{errors.booking_type}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Guest Information</CardTitle>
                        <CardDescription>Contact details of the guest</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="guest_name">Guest Name *</Label>
                                <Input
                                    id="guest_name"
                                    value={data.guest_name}
                                    onChange={(e) => setData('guest_name', e.target.value)}
                                    placeholder="Juan Dela Cruz"
                                />
                                {errors.guest_name && <p className="text-sm text-destructive">{errors.guest_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guest_phone">Phone Number</Label>
                                <Input
                                    id="guest_phone"
                                    value={data.guest_phone}
                                    onChange={(e) => setData('guest_phone', e.target.value)}
                                    placeholder="09xxxxxxxxx"
                                />
                                {errors.guest_phone && <p className="text-sm text-destructive">{errors.guest_phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guest_email">Email</Label>
                                <Input
                                    id="guest_email"
                                    type="email"
                                    value={data.guest_email}
                                    onChange={(e) => setData('guest_email', e.target.value)}
                                    placeholder="guest@example.com"
                                />
                                {errors.guest_email && <p className="text-sm text-destructive">{errors.guest_email}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-3">
                                <Label htmlFor="guest_address">Address</Label>
                                <Input
                                    id="guest_address"
                                    value={data.guest_address}
                                    onChange={(e) => setData('guest_address', e.target.value)}
                                    placeholder="City, Province"
                                />
                                {errors.guest_address && <p className="text-sm text-destructive">{errors.guest_address}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Date & Guests</CardTitle>
                        <CardDescription>Check-in details and guest count</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="check_in_date">Check-in Date *</Label>
                                <Input
                                    id="check_in_date"
                                    type="date"
                                    value={data.check_in_date}
                                    onChange={(e) => setData('check_in_date', e.target.value)}
                                />
                                {errors.check_in_date && <p className="text-sm text-destructive">{errors.check_in_date}</p>}
                            </div>

                            {data.booking_type === 'overnight' && (
                                <div className="space-y-2">
                                    <Label htmlFor="check_out_date">Check-out Date</Label>
                                    <Input
                                        id="check_out_date"
                                        type="date"
                                        value={data.check_out_date}
                                        onChange={(e) => setData('check_out_date', e.target.value)}
                                    />
                                    {errors.check_out_date && <p className="text-sm text-destructive">{errors.check_out_date}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="total_adults">Adults *</Label>
                                <Input
                                    id="total_adults"
                                    type="number"
                                    min="1"
                                    value={data.total_adults}
                                    onChange={(e) => setData('total_adults', e.target.value)}
                                />
                                {errors.total_adults && <p className="text-sm text-destructive">{errors.total_adults}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="total_children">Children</Label>
                                <Input
                                    id="total_children"
                                    type="number"
                                    min="0"
                                    value={data.total_children}
                                    onChange={(e) => setData('total_children', e.target.value)}
                                />
                                {errors.total_children && <p className="text-sm text-destructive">{errors.total_children}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Accommodations *</CardTitle>
                                <CardDescription>Select rooms or cottages</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addAccommodation}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.accommodations.map((item, index) => (
                            <div key={index} className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label>Accommodation</Label>
                                    <Select
                                        value={item.accommodation_id.toString()}
                                        onValueChange={(value) => updateAccommodation(index, 'accommodation_id', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select accommodation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accommodations.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-24 space-y-2">
                                    <Label>Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateAccommodation(index, 'quantity', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="w-24 space-y-2">
                                    <Label>Guests</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.guests}
                                        onChange={(e) => updateAccommodation(index, 'guests', parseInt(e.target.value))}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeAccommodation(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {errors.accommodations && <p className="text-sm text-destructive">{errors.accommodations}</p>}
                        {data.accommodations.length === 0 && (
                            <p className="text-sm text-muted-foreground">No accommodations added yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Any special requests or notes..."
                            rows={3}
                        />
                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button type="submit" disabled={processing}>
                        Create Booking
                    </Button>
                    <Link href="/bookings">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </>
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
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {page}
        </div>
    </AppLayout>
);
