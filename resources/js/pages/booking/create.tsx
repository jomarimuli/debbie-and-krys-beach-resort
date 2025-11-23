// resources/js/pages/booking/create.tsx

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useEffect } from 'react';
import { ArrowLeft, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import bookings from '@/routes/bookings';
import { useAuth } from '@/hooks/use-auth';
import { type Accommodation, type PageProps, type BookingFormData } from '@/types';

type AccommodationFormItem = BookingFormData['accommodations'][0];

export default function Create({ accommodations }: PageProps & { accommodations: Accommodation[] }) {
    const { isCustomer, user } = useAuth();

    const defaultSource = isCustomer() ? 'registered' : 'walkin';

    const minCheckInDate = useMemo(() => {
        const today = new Date();
        if (isCustomer()) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return format(tomorrow, 'yyyy-MM-dd');
        }
        return format(today, 'yyyy-MM-dd');
    }, [isCustomer]);

    const { data, setData, post, processing, errors } = useForm({
        source: defaultSource as 'guest' | 'registered' | 'walkin',
        booking_type: 'day_tour' as 'day_tour' | 'overnight',
        guest_name: isCustomer() ? user?.name || '' : '',
        guest_email: isCustomer() ? user?.email || '' : '',
        guest_phone: isCustomer() ? user?.phone || '' : '',
        guest_address: isCustomer() ? user?.address || '' : '',
        check_in_date: minCheckInDate,
        check_out_date: '',
        total_adults: '1',
        total_children: '0',
        down_payment_required: false,
        down_payment_amount: '',
        notes: '',
        accommodations: [
            { accommodation_id: '', accommodation_rate_id: '', guests: '1' }
        ],
    });

    const minCheckOutDate = useMemo(() => {
        if (data.check_in_date) {
            const checkIn = new Date(data.check_in_date);
            checkIn.setDate(checkIn.getDate() + 1);
            return format(checkIn, 'yyyy-MM-dd');
        }
        return minCheckInDate;
    }, [data.check_in_date, minCheckInDate]);

    const getTotalGuests = () => {
        const adults = parseInt(data.total_adults) || 0;
        const children = parseInt(data.total_children) || 0;
        return adults + children;
    };

    const addAccommodation = () => {
        setData('accommodations', [
            ...data.accommodations,
            { accommodation_id: '', accommodation_rate_id: '', guests: getTotalGuests().toString() }
        ]);
    };

    const removeAccommodation = (index: number) => {
        setData('accommodations', data.accommodations.filter((_, i) => i !== index));
    };

    const updateAccommodation = (index: number, field: keyof AccommodationFormItem, value: string | number) => {
        const updated = [...data.accommodations];
        updated[index] = { ...updated[index], [field]: value };

        if (field === 'accommodation_id') {
            const rates = getAvailableRates(value);
            if (rates.length > 0) {
                updated[index].accommodation_rate_id = rates[0].id.toString();
            } else {
                updated[index].accommodation_rate_id = '';
            }
            updated[index].guests = getTotalGuests().toString();
        }

        setData('accommodations', updated);
    };

    const getAvailableRates = (accommodationId: string | number) => {
        const accommodation = accommodations.find(a => a.id.toString() === accommodationId.toString());
        return accommodation?.rates?.filter(r => r.booking_type === data.booking_type && r.is_active) || [];
    };

    const getSelectedAccommodation = (accommodationId: string | number) => {
        return accommodations.find(a => a.id.toString() === accommodationId.toString());
    };

    const getSelectedRate = (accommodationId: string | number, rateId: string | number) => {
        const accommodation = getSelectedAccommodation(accommodationId);
        return accommodation?.rates?.find(r => r.id.toString() === rateId.toString());
    };

    const calculateBookingTotal = () => {
        let accommodationTotal = 0;
        let entranceFeeTotal = 0;
        let totalFreeEntrances = 0;

        let numberOfNights = 1;
        if (data.booking_type === 'overnight' && data.check_in_date && data.check_out_date) {
            const checkIn = new Date(data.check_in_date);
            const checkOut = new Date(data.check_out_date);
            const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
            numberOfNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        }

        data.accommodations.forEach(item => {
            const accommodation = getSelectedAccommodation(item.accommodation_id);
            const rate = getSelectedRate(item.accommodation_id, item.accommodation_rate_id);

            if (accommodation && rate && item.guests) {
                let baseRate = parseFloat(rate.rate);
                if (data.booking_type === 'overnight') {
                    baseRate = baseRate * numberOfNights;
                }

                let subtotal = baseRate;

                const guestsNum = typeof item.guests === 'string' ? parseInt(item.guests) : item.guests;
                if (accommodation.min_capacity && guestsNum > accommodation.min_capacity) {
                    const additionalGuests = guestsNum - accommodation.min_capacity;
                    let additionalPaxRate = rate.additional_pax_rate ? parseFloat(rate.additional_pax_rate) : 0;

                    if (data.booking_type === 'overnight') {
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

        const adultsNum = typeof data.total_adults === 'string' ? parseInt(data.total_adults) : data.total_adults;
        const childrenNum = typeof data.total_children === 'string' ? parseInt(data.total_children) : data.total_children;

        const adultsNeedingEntrance = Math.max(0, adultsNum - totalFreeEntrances);
        const childrenNeedingEntrance = childrenNum;

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

        const totalAmount = accommodationTotal + entranceFeeTotal;

        return {
            numberOfNights,
            accommodationTotal,
            entranceFeeTotal,
            totalAmount,
            totalFreeEntrances,
        };
    };

    const summary = calculateBookingTotal();

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
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">
                            Guest Information
                            {isCustomer() && (
                                <p className="text-xs text-muted-foreground font-normal mt-1">
                                    To update this information, please edit your profile settings.
                                </p>
                            )}
                        </CardTitle>
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
                                    disabled={isCustomer()}
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
                                    disabled={isCustomer()}
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
                                    disabled={isCustomer()}
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
                                    disabled={isCustomer()}
                                />
                                {errors.guest_address && <p className="text-xs text-destructive">{errors.guest_address}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium">Booking Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="booking_type" className="text-sm cursor-text select-text">Type</Label>
                                <Select
                                    value={data.booking_type}
                                    onValueChange={(value: 'day_tour' | 'overnight') => {
                                        setData('booking_type', value);
                                        setData('accommodations', [
                                            { accommodation_id: '', accommodation_rate_id: '', guests: getTotalGuests().toString() }
                                        ]);
                                        if (value === 'day_tour') {
                                            setData('check_out_date', '');
                                        }
                                    }}
                                >
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
                                />
                                {errors.check_in_date && <p className="text-xs text-destructive">{errors.check_in_date}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="check_out_date" className="text-sm cursor-text select-text">
                                    Check-out Date
                                    {data.booking_type === 'overnight' && <span className="text-destructive ml-1">*</span>}
                                    {data.booking_type === 'day_tour' && (
                                        <span className="text-xs text-muted-foreground ml-1">(Same as check-in)</span>
                                    )}
                                </Label>
                                <Input
                                    id="check_out_date"
                                    type="date"
                                    value={data.booking_type === 'day_tour' ? data.check_in_date : data.check_out_date}
                                    onChange={(e) => setData('check_out_date', e.target.value)}
                                    min={minCheckOutDate}
                                    className="h-9"
                                    required={data.booking_type === 'overnight'}
                                    readOnly={data.booking_type === 'day_tour'}
                                    disabled={data.booking_type === 'day_tour'}
                                />
                                {errors.check_out_date && <p className="text-xs text-destructive">{errors.check_out_date}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 mt-4">
                            <div className="space-y-1.5">
                                {/* <Label htmlFor="source" className="text-sm cursor-text select-text">Source</Label>
                                <Select value={data.source} disabled>
                                    <SelectTrigger className="h-9">
                                        <SelectValue>
                                            {data.source === 'walkin' && 'Walk-in'}
                                            {data.source === 'guest' && 'Guest'}
                                            {data.source === 'registered' && 'Registered'}
                                        </SelectValue>
                                    </SelectTrigger>
                                </Select>
                                {errors.source && <p className="text-xs text-destructive">{errors.source}</p>} */}
                                <p className="text-xs text-muted-foreground">
                                    {data.booking_type === 'overnight' ? '6:00 A.M. - 6:00 A.M.' : '6:00 A.M. - 6:00 P.M.'}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="total_adults" className="text-sm cursor-text select-text">Adults</Label>
                                <Input
                                    id="total_adults"
                                    type="number"
                                    min="1"
                                    value={data.total_adults}
                                    onChange={(e) => {
                                        setData('total_adults', e.target.value);
                                        const totalGuests = (parseInt(e.target.value) || 0) + (parseInt(data.total_children) || 0);
                                        setData('accommodations', data.accommodations.map(acc => ({
                                            ...acc,
                                            guests: totalGuests.toString()
                                        })));
                                    }}
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
                                    onChange={(e) => {
                                        setData('total_children', e.target.value);
                                        const totalGuests = (parseInt(data.total_adults) || 0) + (parseInt(e.target.value) || 0);
                                        setData('accommodations', data.accommodations.map(acc => ({
                                            ...acc,
                                            guests: totalGuests.toString()
                                        })));
                                    }}
                                    className="h-9"
                                />
                                {errors.total_children && <p className="text-xs text-destructive">{errors.total_children}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-medium">Accommodations</CardTitle>
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
                                                value={item.accommodation_id.toString()}
                                                onValueChange={(value) => updateAccommodation(index, 'accommodation_id', value)}
                                            >
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accommodations.map((acc) => {
                                                        const rates = acc.rates?.filter(r => r.booking_type === data.booking_type && r.is_active) || [];
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
                                            <Label className="text-sm cursor-text select-text">
                                                Rate
                                                <span className="text-xs text-muted-foreground ml-1">(Auto)</span>
                                            </Label>
                                            <Input
                                                value={selectedRate ? `₱${parseFloat(selectedRate.rate).toLocaleString()}` : ''}
                                                className="h-9"
                                                readOnly
                                                disabled
                                                placeholder="Select accommodation first"
                                            />
                                            {errors[`accommodations.${index}.accommodation_rate_id` as keyof typeof errors] && (
                                                <p className="text-xs text-destructive">
                                                    {errors[`accommodations.${index}.accommodation_rate_id` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex-1">
                                                <Label className="text-sm cursor-text select-text">
                                                    Guests
                                                    <span className="text-xs text-muted-foreground ml-1">(Auto)</span>
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={item.guests}
                                                    className="h-9"
                                                    readOnly
                                                    disabled
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
                                                <span>Base Rate (Min: {selectedAccommodation.min_capacity || 0}, Max: {selectedAccommodation.max_capacity || 0} pax):</span>
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

                {data.accommodations.some(a => a.accommodation_id && a.accommodation_rate_id) && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium">Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {data.booking_type === 'overnight' && data.check_in_date && data.check_out_date && (
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
                                    <span className="font-medium text-green-600">{summary.totalFreeEntrances} pax</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm border-t pt-2">
                                <span className="font-semibold">Total Amount</span>
                                <span className="font-semibold text-lg">₱{summary.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-2">
                    <Button type="submit" disabled={processing} size="sm">
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
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
