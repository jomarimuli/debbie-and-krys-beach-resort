// resources/js/pages/rebooking/create.tsx - Update to use minRebookDate

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, AlertCircle, LoaderCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Accommodation, type Booking, type PageProps } from '@/types';
import { format } from 'date-fns';
import rebookings from '@/routes/rebookings';
import bookings from '@/routes/bookings';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AccommodationItem {
    accommodation_id: string;
    accommodation_rate_id: string;
    guests: string;
}

export default function Create({
    booking,
    accommodations,
    minRebookDate
}: PageProps & {
    booking: Booking;
    accommodations: Accommodation[];
    minRebookDate: string;
}) {
    const { data, setData, post, processing, errors } = useForm({
        original_booking_id: booking.id,
        new_check_in_date: minRebookDate,
        new_check_out_date: booking.booking_type === 'overnight' ? '' : undefined,
        new_total_adults: booking.total_adults.toString(),
        new_total_children: booking.total_children.toString(),
        reason: '',
        accommodations: booking.accommodations?.map(acc => ({
            accommodation_id: acc.accommodation_id.toString(),
            accommodation_rate_id: acc.accommodation_rate_id.toString(),
            guests: acc.guests.toString(),
        })) || [
            { accommodation_id: '', accommodation_rate_id: '', guests: '1' }
        ] as AccommodationItem[],
    });

    // Calculate min check-out date
    const minCheckOutDate = useMemo(() => {
        if (data.new_check_in_date) {
            const checkIn = new Date(data.new_check_in_date);
            checkIn.setDate(checkIn.getDate() + 1);
            return format(checkIn, 'yyyy-MM-dd');
        }
        return minRebookDate;
    }, [data.new_check_in_date, minRebookDate]);

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
        return accommodation?.rates?.filter(r => r.booking_type === booking.booking_type && r.is_active) || [];
    };

    const getSelectedAccommodation = (accommodationId: string) => {
        return accommodations.find(a => a.id.toString() === accommodationId);
    };

    const getSelectedRate = (accommodationId: string, rateId: string) => {
        const accommodation = getSelectedAccommodation(accommodationId);
        return accommodation?.rates?.find(r => r.id.toString() === rateId);
    };

    const calculateRebookingTotal = () => {
        let accommodationTotal = 0;
        let entranceFeeTotal = 0;
        let totalFreeEntrances = 0;

        let numberOfNights = 1;
        if (booking.booking_type === 'overnight' && data.new_check_in_date && data.new_check_out_date) {
            const checkIn = new Date(data.new_check_in_date);
            const checkOut = new Date(data.new_check_out_date);
            const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
            numberOfNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        data.accommodations.forEach(item => {
            const accommodation = getSelectedAccommodation(item.accommodation_id);
            const rate = getSelectedRate(item.accommodation_id, item.accommodation_rate_id);

            if (accommodation && rate && item.guests) {
                let baseRate = parseFloat(rate.rate);
                if (booking.booking_type === 'overnight') {
                    baseRate = baseRate * numberOfNights;
                }

                let subtotal = baseRate;

                if (accommodation.min_capacity && parseInt(item.guests) > accommodation.min_capacity) {
                    const additionalGuests = parseInt(item.guests) - accommodation.min_capacity;
                    let additionalPaxRate = rate.additional_pax_rate ? parseFloat(rate.additional_pax_rate) : 0;

                    if (booking.booking_type === 'overnight') {
                        additionalPaxRate = additionalPaxRate * numberOfNights;
                    }

                    subtotal += additionalGuests * additionalPaxRate;
                }

                accommodationTotal += subtotal;

                if (rate.includes_free_entrance) {
                    totalFreeEntrances += Math.min(parseInt(item.guests), accommodation.min_capacity || 0);
                }
            }
        });

        const adultsNeedingEntrance = Math.max(0, parseInt(data.new_total_adults || '0') - totalFreeEntrances);
        const childrenNeedingEntrance = parseInt(data.new_total_children || '0');

        const firstAccom = data.accommodations[0];
        if (firstAccom?.accommodation_rate_id) {
            const firstRate = getSelectedRate(firstAccom.accommodation_id, firstAccom.accommodation_rate_id);

            if (firstRate) {
                if (adultsNeedingEntrance > 0 && firstRate.adult_entrance_fee) {
                    entranceFeeTotal += adultsNeedingEntrance * parseFloat(firstRate.adult_entrance_fee);
                }

                if (childrenNeedingEntrance > 0 && firstRate.child_entrance_fee) {
                    entranceFeeTotal += childrenNeedingEntrance * parseFloat(firstRate.child_entrance_fee);
                }
            }
        }

        const newAmount = accommodationTotal + entranceFeeTotal;
        const originalAmount = parseFloat(booking.total_amount);
        const amountDifference = newAmount - originalAmount;

        return {
            numberOfNights,
            accommodationTotal,
            entranceFeeTotal,
            newAmount,
            originalAmount,
            amountDifference,
            totalFreeEntrances,
        };
    };

    const summary = calculateRebookingTotal();

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(rebookings.store.url());
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
                    <h1 className="text-xl font-semibold">Create Rebooking</h1>
                    <p className="text-sm text-muted-foreground">Modify booking {booking.booking_number}</p>
                </div>
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    You are rebooking for <strong>{booking.guest_name}</strong>. Original check-in: {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                </AlertDescription>
            </Alert>

            <form onSubmit={submit} className="space-y-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Original Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Booking Number</p>
                                <p className="font-medium">{booking.booking_number}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Check-in Date</p>
                                <p className="font-medium">{format(new Date(booking.check_in_date), 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
                                <p className="font-medium">₱{parseFloat(booking.total_amount).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Guests</p>
                                <p className="font-medium">{booking.total_adults} Adults, {booking.total_children} Children</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Type</p>
                                <Badge variant="outline" className="capitalize text-xs">
                                    {booking.booking_type.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                                <Badge variant="outline" className="capitalize text-xs">
                                    {booking.status}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">New Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="new_check_in_date" className="text-sm cursor-text select-text">
                                    New Check-in Date
                                    <span className="text-xs text-muted-foreground ml-1">
                                        (Min: {format(new Date(minRebookDate), 'MMM dd, yyyy')})
                                    </span>
                                </Label>
                                <Input
                                    id="new_check_in_date"
                                    type="date"
                                    value={data.new_check_in_date}
                                    onChange={(e) => setData('new_check_in_date', e.target.value)}
                                    min={minRebookDate}
                                    className="h-9"
                                />
                                {errors.new_check_in_date && <p className="text-xs text-destructive">{errors.new_check_in_date}</p>}
                            </div>

                            {booking.booking_type === 'overnight' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="new_check_out_date" className="text-sm cursor-text select-text">
                                        New Check-out Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="new_check_out_date"
                                        type="date"
                                        value={data.new_check_out_date || ''}
                                        onChange={(e) => setData('new_check_out_date', e.target.value)}
                                        min={minCheckOutDate}
                                        className="h-9"
                                        required
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
                                                        const rates = acc.rates?.filter(r => r.booking_type === booking.booking_type && r.is_active) || [];
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

                {data.accommodations.some(a => a.accommodation_id && a.accommodation_rate_id) && (
                    <Card className="border-purple-200 bg-purple-50/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium">Rebooking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {booking.booking_type === 'overnight' && data.new_check_in_date && data.new_check_out_date && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Number of Nights</span>
                                    <span className="font-medium">{summary.numberOfNights} {summary.numberOfNights === 1 ? 'night' : 'nights'}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Original Amount</p>
                                    <p className="font-medium">₱{summary.originalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">New Amount</p>
                                    <p className="font-medium">₱{summary.newAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                            </div>

                            <div className="flex justify-between text-sm border-t pt-2">
                                <span className="font-semibold">Amount Difference</span>
                                <span className={`font-semibold text-lg ${summary.amountDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {summary.amountDifference >= 0 ? '+' : ''}₱{Math.abs(summary.amountDifference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            {summary.amountDifference > 0 && (
                                <p className="text-xs text-green-700 bg-green-100 p-2 rounded">
                                    Guest needs to pay additional amount
                                </p>
                            )}
                            {summary.amountDifference < 0 && (
                                <p className="text-xs text-red-700 bg-red-100 p-2 rounded">
                                    Guest will receive a refund
                                </p>
                            )}
                            {summary.amountDifference === 0 && (
                                <p className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                                    No payment or refund needed
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing} size="sm">
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        Submit Rebooking Request
                    </Button>
                    <Link href={bookings.show.url({ booking: booking.id })}>
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
            { title: 'Rebook', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
