// resources/js/pages/booking/edit.tsx - Fix the form initialization

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
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Booking, type Accommodation, type User, type PageProps } from '@/types';
import { format } from 'date-fns';
import bookings from '@/routes/bookings';
import { useAuth } from '@/hooks/use-auth';

type AccommodationFormItem = {
    accommodation_id: string;
    accommodation_rate_id: string;
    guests: string;
};

export default function Edit({ booking, accommodations, users }: PageProps & {
    booking: Booking;
    accommodations: Accommodation[];
    users: User[];
}) {
    const { isCustomer, isAdmin, isStaff } = useAuth();

    const isPending = booking.status === 'pending';
    const canEditAccommodations = isPending;

    const minCheckInDate = useMemo(() => {
        const today = new Date();
        if (isCustomer()) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return format(tomorrow, 'yyyy-MM-dd');
        }
        return format(today, 'yyyy-MM-dd');
    }, [isCustomer]);

    const { data, setData, put, processing, errors } = useForm({
        guest_name: booking.guest_name,
        guest_email: booking.guest_email || '',
        guest_phone: booking.guest_phone || '',
        guest_address: booking.guest_address || '',
        check_in_date: format(new Date(booking.check_in_date), 'yyyy-MM-dd'),
        check_out_date: booking.check_out_date ? format(new Date(booking.check_out_date), 'yyyy-MM-dd') : '',
        total_adults: booking.total_adults.toString(),
        total_children: booking.total_children.toString(),
        down_payment_required: booking.down_payment_required,
        down_payment_amount: booking.down_payment_amount || '',
        notes: booking.notes || '',
        status: booking.status,
        accommodations: booking.accommodations?.map(acc => ({
            accommodation_id: acc.accommodation_id.toString(),
            accommodation_rate_id: acc.accommodation_rate_id.toString(),
            guests: acc.guests.toString(),
        })) || [
            { accommodation_id: '', accommodation_rate_id: '', guests: '1' }
        ] as AccommodationFormItem[],
    });

    const minCheckOutDate = useMemo(() => {
        if (data.check_in_date) {
            const checkIn = new Date(data.check_in_date);
            checkIn.setDate(checkIn.getDate() + 1);
            return format(checkIn, 'yyyy-MM-dd');
        }
        return minCheckInDate;
    }, [data.check_in_date, minCheckInDate]);

    const addAccommodation = () => {
        setData('accommodations', [
            ...data.accommodations,
            { accommodation_id: '', accommodation_rate_id: '', guests: '1' }
        ]);
    };

    const removeAccommodation = (index: number) => {
        setData('accommodations', data.accommodations.filter((_, i) => i !== index));
    };

    const updateAccommodation = (index: number, field: keyof AccommodationFormItem, value: string) => {
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

    const calculateBookingSummary = () => {
        let accommodationTotal = 0;
        let entranceFeeTotal = 0;
        let totalFreeEntrances = 0;

        let numberOfNights = 1;
        if (booking.booking_type === 'overnight' && data.check_in_date && data.check_out_date) {
            const checkIn = new Date(data.check_in_date);
            const checkOut = new Date(data.check_out_date);
            const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
            numberOfNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        data.accommodations?.forEach(item => {
            const accommodation = getSelectedAccommodation(item.accommodation_id);
            const rate = getSelectedRate(item.accommodation_id, item.accommodation_rate_id);

            if (accommodation && rate && item.guests) {
                let baseRate = parseFloat(rate.rate);
                if (booking.booking_type === 'overnight') {
                    baseRate = baseRate * numberOfNights;
                }

                let subtotal = baseRate;

                const guestsNum = parseInt(item.guests);
                if (accommodation.min_capacity && guestsNum > accommodation.min_capacity) {
                    const additionalGuests = guestsNum - accommodation.min_capacity;
                    let additionalPaxRate = rate.additional_pax_rate ? parseFloat(rate.additional_pax_rate) : 0;

                    if (booking.booking_type === 'overnight') {
                        additionalPaxRate = additionalPaxRate * numberOfNights;
                    }

                    subtotal += additionalGuests * additionalPaxRate;
                }

                accommodationTotal += subtotal;

                if (rate.includes_free_entrance) {
                    totalFreeEntrances += Math.min(guestsNum, accommodation.min_capacity || 0);
                }
            }
        });

        const adultsNeedingEntrance = Math.max(0, parseInt(data.total_adults || '0') - totalFreeEntrances);
        const childrenNeedingEntrance = parseInt(data.total_children || '0');

        const firstAccom = data.accommodations?.[0];
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

        const totalAmount = accommodationTotal + entranceFeeTotal;

        return {
            numberOfNights,
            accommodationTotal,
            entranceFeeTotal,
            totalAmount,
            totalFreeEntrances,
        };
    };

    const summary = calculateBookingSummary();

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
                                <Label htmlFor="check_in_date" className="text-sm cursor-text select-text">
                                    Check-in Date
                                    {isCustomer() && (
                                        <span className="text-xs text-muted-foreground ml-1">(Tomorrow onwards)</span>
                                    )}
                                </Label>
                                <Input
                                    id="check_in_date"
                                    type="date"
                                    value={data.check_in_date}
                                    onChange={(e) => setData('check_in_date', e.target.value)}
                                    min={minCheckInDate}
                                    className="h-9"
                                    disabled={!isPending}
                                />
                                {errors.check_in_date && <p className="text-xs text-destructive">{errors.check_in_date}</p>}
                            </div>

                            {booking.booking_type === 'overnight' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="check_out_date" className="text-sm cursor-text select-text">
                                        Check-out Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="check_out_date"
                                        type="date"
                                        value={data.check_out_date}
                                        onChange={(e) => setData('check_out_date', e.target.value)}
                                        min={minCheckOutDate}
                                        className="h-9"
                                        required
                                        disabled={!isPending}
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
                                    disabled={!isPending}
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
                                    disabled={!isPending}
                                />
                                {errors.total_children && <p className="text-xs text-destructive">{errors.total_children}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="status" className="text-sm cursor-text select-text">Status</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value: any) => setData('status', value)}
                                    disabled={isCustomer()}
                                >
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

                        {!isPending && (
                            <div className="bg-amber-50 border border-amber-200 rounded p-3">
                                <p className="text-xs text-amber-800">
                                    Dates, guest count, and accommodations cannot be edited for non-pending bookings. Please create a rebooking request to modify these details.
                                </p>
                            </div>
                        )}

                        {canEditAccommodations && (
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
                                                                <span>Entrance Fee (Child ≤{selectedRate.child_max_age}yo):</span>
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
                        )}

                        {!canEditAccommodations && booking.accommodations && booking.accommodations.length > 0 && (
                            <Card className="border-blue-200 bg-blue-50/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">
                                        Current Accommodations
                                        <span className="text-xs text-muted-foreground ml-2">(Read-only)</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        {booking.accommodations.map((item) => (
                                            <div key={item.id} className="flex justify-between items-start p-2 bg-white border rounded">
                                                <div>
                                                    <p className="font-medium">{item.accommodation?.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.guests} guests · {item.accommodation_rate?.booking_type.replace('_', ' ')}
                                                    </p>
                                                </div>
                                                <p className="font-medium">₱{parseFloat(item.subtotal).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="border-blue-200 bg-blue-50/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">Booking Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {booking.booking_type === 'overnight' && data.check_in_date && data.check_out_date && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Number of Nights</span>
                                        <span className="font-medium">{summary.numberOfNights} {summary.numberOfNights === 1 ? 'night' : 'nights'}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Accommodation Total</span>
                                    <span className="font-medium">₱{summary.accommodationTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Entrance Fee Total</span>
                                    <span className="font-medium">₱{summary.entranceFeeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {summary.totalFreeEntrances > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Free Entrances</span>
                                        <span className="font-medium text-blue-600">{summary.totalFreeEntrances} pax</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm border-t pt-2">
                                    <span className="font-semibold">Total Amount</span>
                                    <span className="font-semibold text-lg">₱{summary.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                {data.down_payment_required && data.down_payment_amount && (
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Down Payment Required</span>
                                            <span className="font-medium text-blue-600">₱{parseFloat(data.down_payment_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2 items-start pt-4">
                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="down_payment_required"
                                    checked={data.down_payment_required}
                                    onChange={(e) => {
                                        setData('down_payment_required', e.target.checked);
                                        if (!e.target.checked) {
                                            setData('down_payment_amount', '');
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300"
                                    disabled={isCustomer()}
                                />
                                <Label htmlFor="down_payment_required" className="text-sm cursor-pointer">
                                    Require down payment
                                </Label>
                            </div>

                            {data.down_payment_required && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="down_payment_amount" className="text-sm cursor-text select-text">
                                        Down Payment Amount
                                    </Label>
                                    <Input
                                        id="down_payment_amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={data.down_payment_amount}
                                        onChange={(e) => setData('down_payment_amount', e.target.value)}
                                        className="h-9"
                                        placeholder="0.00"
                                        disabled={isCustomer()}
                                    />
                                    {errors.down_payment_amount && (
                                        <p className="text-xs text-destructive">{errors.down_payment_amount}</p>
                                    )}
                                    {errors.down_payment_required && (
                                        <p className="text-xs text-destructive">{errors.down_payment_required}</p>
                                    )}
                                    {parseFloat(booking.down_payment_paid) > 0 && (
                                        <p className="text-xs text-blue-600">
                                            Already paid: ₱{parseFloat(booking.down_payment_paid).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="notes" className="text-sm cursor-text select-text">Notes</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={2}
                                className="resize-none"
                                placeholder="Requests or remarks..."
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
