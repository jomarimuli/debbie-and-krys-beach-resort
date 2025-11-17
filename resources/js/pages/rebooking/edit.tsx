// resources/js/pages/rebooking/edit.tsx

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Accommodation, type Rebooking, type PageProps } from '@/types';
import { format } from 'date-fns';
import rebookings from '@/routes/rebookings';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AccommodationItem {
    accommodation_id: string;
    accommodation_rate_id: string;
    guests: string;
}

export default function Edit({
    rebooking,
    accommodations
}: PageProps & {
    rebooking: Rebooking;
    accommodations: Accommodation[];
}) {
    const { data, setData, put, processing, errors } = useForm({
        new_check_in_date: format(new Date(rebooking.new_check_in_date), 'yyyy-MM-dd'),
        new_check_out_date: rebooking.new_check_out_date ? format(new Date(rebooking.new_check_out_date), 'yyyy-MM-dd') : '',
        new_total_adults: rebooking.new_total_adults.toString(),
        new_total_children: rebooking.new_total_children.toString(),
        reason: rebooking.reason || '',
        accommodations: rebooking.accommodations?.map(acc => ({
            accommodation_id: acc.accommodation_id.toString(),
            accommodation_rate_id: acc.accommodation_rate_id.toString(),
            guests: acc.guests.toString(),
        })) || [
            { accommodation_id: '', accommodation_rate_id: '', guests: '1' }
        ] as AccommodationItem[],
    });

    const bookingType = rebooking.original_booking?.booking_type || 'day_tour';

    const addAccommodation = () => {
        setData('accommodations', [
            ...data.accommodations,
            { accommodation_id: '', accommodation_rate_id: '', guests: '1' }
        ]);
    };

    const removeAccommodation = (index: number) => {
        setData('accommodations', data.accommodations.filter((_, i) => i !== index));
    };

    const updateAccommodation = (index: number, field: keyof AccommodationItem, value: string) => {
        const updated = [...data.accommodations];
        updated[index] = { ...updated[index], [field]: value };

        if (field === 'accommodation_id') {
            updated[index].accommodation_rate_id = '';
        }

        setData('accommodations', updated);
    };

    const getAvailableRates = (accommodationId: string) => {
        const accommodation = accommodations.find(a => a.id.toString() === accommodationId);
        return accommodation?.rates?.filter(r => r.booking_type === bookingType && r.is_active) || [];
    };

    const getSelectedAccommodation = (accommodationId: string) => {
        return accommodations.find(a => a.id.toString() === accommodationId);
    };

    const getSelectedRate = (accommodationId: string, rateId: string) => {
        const accommodation = getSelectedAccommodation(accommodationId);
        return accommodation?.rates?.find(r => r.id.toString() === rateId);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(rebookings.update.url({ rebooking: rebooking.id }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={rebookings.show.url({ rebooking: rebooking.id })}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">Edit Rebooking</h1>
                    <p className="text-sm text-muted-foreground">{rebooking.rebooking_number}</p>
                </div>
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Editing rebooking request. Original booking: <strong>{rebooking.original_booking?.booking_number}</strong>
                </AlertDescription>
            </Alert>

            <form onSubmit={submit} className="space-y-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Original Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {rebooking.original_booking && (
                            <div className="grid gap-3 md:grid-cols-3 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Booking Number</p>
                                    <p className="font-medium">{rebooking.original_booking.booking_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Guest</p>
                                    <p className="font-medium">{rebooking.original_booking.guest_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Original Check-in</p>
                                    <p className="font-medium">{format(new Date(rebooking.original_booking.check_in_date), 'MMM dd, yyyy')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Original Amount</p>
                                    <p className="font-medium">₱{parseFloat(rebooking.original_amount).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Type</p>
                                    <Badge variant="outline" className="capitalize text-xs">
                                        {rebooking.original_booking.booking_type.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                                    <Badge variant="outline" className="capitalize text-xs">
                                        {rebooking.status}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">New Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new_check_in_date" className="text-sm cursor-text select-text">New Check-in Date</Label>
                                <Input
                                    id="new_check_in_date"
                                    type="date"
                                    value={data.new_check_in_date}
                                    onChange={(e) => setData('new_check_in_date', e.target.value)}
                                    className="h-9"
                                />
                                {errors.new_check_in_date && <p className="text-xs text-destructive">{errors.new_check_in_date}</p>}
                            </div>

                            {bookingType === 'overnight' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="new_check_out_date" className="text-sm cursor-text select-text">New Check-out Date</Label>
                                    <Input
                                        id="new_check_out_date"
                                        type="date"
                                        value={data.new_check_out_date}
                                        onChange={(e) => setData('new_check_out_date', e.target.value)}
                                        className="h-9"
                                    />
                                    {errors.new_check_out_date && <p className="text-xs text-destructive">{errors.new_check_out_date}</p>}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="new_total_adults" className="text-sm cursor-text select-text">Adults</Label>
                                <Input
                                    id="new_total_adults"
                                    type="number"
                                    min="1"
                                    value={data.new_total_adults}
                                    onChange={(e) => setData('new_total_adults', e.target.value)}
                                    className="h-9"
                                />
                                {errors.new_total_adults && <p className="text-xs text-destructive">{errors.new_total_adults}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="new_total_children" className="text-sm cursor-text select-text">Children</Label>
                                <Input
                                    id="new_total_children"
                                    type="number"
                                    min="0"
                                    value={data.new_total_children}
                                    onChange={(e) => setData('new_total_children', e.target.value)}
                                    className="h-9"
                                />
                                {errors.new_total_children && <p className="text-xs text-destructive">{errors.new_total_children}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                        {data.accommodations.map((item, index) => {
                            const selectedAccommodation = getSelectedAccommodation(item.accommodation_id);
                            const availableRates = getAvailableRates(item.accommodation_id);
                            const selectedRate = getSelectedRate(item.accommodation_id, item.accommodation_rate_id);

                            return (
                                <div key={index} className="p-3 border rounded space-y-3">
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div className="space-y-1.5">
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
                                                        const rates = acc.rates?.filter(r => r.booking_type === bookingType && r.is_active) || [];
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
                                            {errors[`accommodations.${index}.accommodation_id` as keyof typeof errors] && (
                                                <p className="text-xs text-destructive">
                                                    {errors[`accommodations.${index}.accommodation_id` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-sm cursor-text select-text">Rate</Label>
                                            <Select
                                                value={item.accommodation_rate_id}
                                                onValueChange={(value) => updateAccommodation(index, 'accommodation_rate_id', value)}
                                                disabled={!item.accommodation_id || availableRates.length === 0}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select rate..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableRates.map((rate) => (
                                                        <SelectItem key={rate.id} value={rate.id.toString()}>
                                                            ₱{parseFloat(rate.rate).toLocaleString()}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors[`accommodations.${index}.accommodation_rate_id` as keyof typeof errors] && (
                                                <p className="text-xs text-destructive">
                                                    {errors[`accommodations.${index}.accommodation_rate_id` as keyof typeof errors]}
                                                </p>
                                            )}
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
                                                {errors[`accommodations.${index}.guests` as keyof typeof errors] && (
                                                    <p className="text-xs text-destructive">
                                                        {errors[`accommodations.${index}.guests` as keyof typeof errors]}
                                                    </p>
                                                )}
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

                                    {selectedRate && selectedAccommodation && (
                                        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                                            <div className="flex justify-between">
                                                <span>Base Rate ({selectedAccommodation.min_capacity || 0} pax):</span>
                                                <span className="font-medium">₱{parseFloat(selectedRate.rate).toLocaleString()}</span>
                                            </div>
                                            {selectedRate.additional_pax_rate && (
                                                <div className="flex justify-between">
                                                    <span>Additional Pax Rate:</span>
                                                    <span className="font-medium">₱{parseFloat(selectedRate.additional_pax_rate).toLocaleString()}/head</span>
                                                </div>
                                            )}
                                            {selectedRate.adult_entrance_fee && (
                                                <div className="flex justify-between">
                                                    <span>Entrance Fee (Adult):</span>
                                                    <span className="font-medium">₱{parseFloat(selectedRate.adult_entrance_fee).toLocaleString()}/head</span>
                                                </div>
                                            )}
                                            {selectedRate.child_entrance_fee && (
                                                <div className="flex justify-between">
                                                    <span>Entrance Fee (Child):</span>
                                                    <span className="font-medium">₱{parseFloat(selectedRate.child_entrance_fee).toLocaleString()}/head</span>
                                                </div>
                                            )}
                                            <div className="flex gap-2 pt-1">
                                                {selectedRate.includes_free_cottage && (
                                                    <Badge variant="secondary" className="text-xs">Free Cottage</Badge>
                                                )}
                                                {selectedRate.includes_free_entrance && (
                                                    <Badge variant="secondary" className="text-xs">Free Entrance</Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {errors.accommodations && <p className="text-xs text-destructive">{errors.accommodations}</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Reason for Rebooking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            rows={3}
                            className="resize-none"
                            placeholder="Optional: Explain why this booking needs to be modified..."
                        />
                        {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing} size="sm">
                        Update Rebooking Request
                    </Button>
                    <Link href={rebookings.show.url({ rebooking: rebooking.id })}>
                        <Button type="button" variant="outline" size="sm">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Rebookings', href: '/rebookings' },
            { title: 'Edit', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
