// resources/js/pages/payment/create.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Upload, X, RefreshCw } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Booking, type Rebooking, type PaymentAccount, type PageProps } from '@/types';
import { format } from 'date-fns';
import payments from '@/routes/payments';

export default function Create({
    bookings,
    rebookings,
    payment_accounts,
    preselected_rebooking_id
}: PageProps & {
    bookings: Booking[];
    rebookings?: Rebooking[];
    payment_accounts: PaymentAccount[];
    preselected_rebooking_id?: number;
}) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [paymentType, setPaymentType] = useState<'booking' | 'rebooking'>('booking');

    const { data, setData, post, processing, errors } = useForm({
        booking_id: '',
        rebooking_id: '',
        amount: '',
        is_down_payment: false,
        is_rebooking_payment: false,
        payment_account_id: '',
        reference_number: '',
        reference_image: null as File | null,
        notes: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
    });

    const selectedBooking = bookings.find((b) => b.id === parseInt(data.booking_id));
    const selectedRebooking = rebookings?.find((r) => r.id === parseInt(data.rebooking_id));

    // Check if down payment is fully paid
    const isDownPaymentFullyPaid = useMemo(() => {
        if (!selectedBooking?.down_payment_required) return false;
        return parseFloat(selectedBooking.down_payment_balance) <= 0;
    }, [selectedBooking]);

    useEffect(() => {
        if (paymentType === 'booking') {
            setData({
                ...data,
                rebooking_id: '',
                is_rebooking_payment: false,
            });
        } else {
            setData({
                ...data,
                is_down_payment: false,
                is_rebooking_payment: true,
            });
        }
    }, [paymentType]);

    useEffect(() => {
        if (selectedRebooking) {
            setData({
                ...data,
                booking_id: selectedRebooking.original_booking_id.toString(),
            });
        }
    }, [data.rebooking_id]);

    useEffect(() => {
        if (preselected_rebooking_id && rebookings) {
            setPaymentType('rebooking');
            setData('rebooking_id', preselected_rebooking_id.toString());
        }
    }, [preselected_rebooking_id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('reference_image', file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('reference_image', null);
        setImagePreview(null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(payments.store.url(), {
            forceFormData: true,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={payments.index.url()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">Record Payment</h1>
                    <p className="text-sm text-muted-foreground">Add a new payment record</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Payment Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={paymentType === 'booking' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPaymentType('booking')}
                        >
                            Booking Payment
                        </Button>
                        {rebookings && rebookings.length > 0 && (
                            <Button
                                type="button"
                                variant={paymentType === 'rebooking' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPaymentType('rebooking')}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Rebooking Payment
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        {paymentType === 'booking' ? (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="booking_id" className="text-sm cursor-text select-text">Booking</Label>
                                    <Select value={data.booking_id} onValueChange={(value) => setData('booking_id', value)}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select booking" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bookings.map((booking) => (
                                                <SelectItem key={booking.id} value={booking.id.toString()}>
                                                    {booking.booking_number} - {booking.guest_name} (Balance: ₱
                                                    {parseFloat(booking.balance).toLocaleString()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.booking_id && <p className="text-xs text-destructive">{errors.booking_id}</p>}
                                </div>

                                {selectedBooking && (
                                    <>
                                        <div className="rounded border p-3 bg-muted/30 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Guest:</span>
                                                <span className="font-medium">{selectedBooking.guest_name}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Total:</span>
                                                <span className="font-medium">
                                                    ₱{parseFloat(selectedBooking.total_amount).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Paid:</span>
                                                <span className="font-medium text-green-600">
                                                    ₱{parseFloat(selectedBooking.paid_amount).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm border-t pt-2">
                                                <span className="font-semibold">Balance:</span>
                                                <span className="font-semibold text-red-600">
                                                    ₱{parseFloat(selectedBooking.balance).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {selectedBooking.down_payment_required && (
                                            <>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id="is_down_payment"
                                                            checked={data.is_down_payment}
                                                            onChange={(e) => setData('is_down_payment', e.target.checked)}
                                                            disabled={isDownPaymentFullyPaid}
                                                            className="h-4 w-4 rounded border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        />
                                                        <Label
                                                            htmlFor="is_down_payment"
                                                            className={`text-sm ${isDownPaymentFullyPaid ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                        >
                                                            This is a down payment
                                                            {isDownPaymentFullyPaid && (
                                                                <span className="text-xs text-green-600 ml-2">(Fully Paid)</span>
                                                            )}
                                                        </Label>
                                                    </div>
                                                    {errors.is_down_payment && <p className="text-xs text-destructive">{errors.is_down_payment}</p>}
                                                </div>

                                                <div className={`rounded border p-3 space-y-2 ${isDownPaymentFullyPaid ? 'bg-green-50 border-green-200' : 'bg-blue-50'}`}>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Down Payment Required:</span>
                                                        <span className="font-medium">
                                                            ₱{parseFloat(selectedBooking.down_payment_amount || '0').toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Down Payment Paid:</span>
                                                        <span className="font-medium text-green-600">
                                                            ₱{parseFloat(selectedBooking.down_payment_paid).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm border-t pt-2">
                                                        <span className="font-semibold">Down Payment Balance:</span>
                                                        <span className={`font-semibold ${isDownPaymentFullyPaid ? 'text-green-600' : 'text-red-600'}`}>
                                                            ₱{parseFloat(selectedBooking.down_payment_balance).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="rebooking_id" className="text-sm cursor-text select-text">
                                        <RefreshCw className="h-3.5 w-3.5 inline mr-1" />
                                        Rebooking
                                    </Label>
                                    <Select value={data.rebooking_id} onValueChange={(value) => setData('rebooking_id', value)}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select rebooking" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rebookings?.map((rebooking) => (
                                                <SelectItem key={rebooking.id} value={rebooking.id.toString()}>
                                                    {rebooking.rebooking_number} - {rebooking.original_booking?.guest_name} (Remaining: ₱
                                                    {parseFloat(rebooking.remaining_payment || '0').toLocaleString()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.rebooking_id && <p className="text-xs text-destructive">{errors.rebooking_id}</p>}
                                </div>

                                {selectedRebooking && (
                                    <div className="rounded border p-3 bg-purple-50 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Guest:</span>
                                            <span className="font-medium">{selectedRebooking.original_booking?.guest_name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Total Adjustment:</span>
                                            <span className="font-medium text-green-600">
                                                +₱{parseFloat(selectedRebooking.total_adjustment).toLocaleString()}
                                            </span>
                                        </div>
                                        {selectedRebooking.total_paid && parseFloat(selectedRebooking.total_paid) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Already Paid:</span>
                                                <span className="font-medium text-green-600">
                                                    ₱{parseFloat(selectedRebooking.total_paid).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm border-t pt-2">
                                            <span className="font-semibold">Remaining Payment:</span>
                                            <span className="font-semibold text-red-600">
                                                ₱{parseFloat(selectedRebooking.remaining_payment || '0').toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="amount" className="text-sm cursor-text select-text">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className="h-9"
                                />
                                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="payment_account_id" className="text-sm cursor-text select-text">
                                    Payment Account (Optional)
                                </Label>
                                <Select
                                    value={data.payment_account_id || 'none'}
                                    onValueChange={(value) => setData('payment_account_id', value === 'none' ? '' : value)}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select account or cash" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Cash (No Account)</SelectItem>
                                        {payment_accounts.map((account) => (
                                            <SelectItem key={account.id} value={account.id.toString()}>
                                                {account.account_name} ({account.type.toUpperCase()})
                                                {account.account_number && ` - ${account.account_number}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.payment_account_id && <p className="text-xs text-destructive">{errors.payment_account_id}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="reference_number" className="text-sm cursor-text select-text">Reference Number</Label>
                                <Input
                                    id="reference_number"
                                    value={data.reference_number}
                                    onChange={(e) => setData('reference_number', e.target.value)}
                                    className="h-9"
                                />
                                {errors.reference_number && <p className="text-xs text-destructive">{errors.reference_number}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="payment_date" className="text-sm cursor-text select-text">Payment Date</Label>
                                <Input
                                    id="payment_date"
                                    type="date"
                                    value={data.payment_date}
                                    onChange={(e) => setData('payment_date', e.target.value)}
                                    className="h-9"
                                />
                                {errors.payment_date && <p className="text-xs text-destructive">{errors.payment_date}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reference_image" className="text-sm cursor-text select-text">Reference Image</Label>
                            {!imagePreview ? (
                                <div className="border-2 border-dashed rounded p-4 text-center">
                                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                    <Input
                                        id="reference_image"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <Label htmlFor="reference_image" className="cursor-pointer">
                                        <span className="text-xs text-primary hover:underline">
                                            Click to upload
                                        </span>
                                    </Label>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-muted-foreground mb-1.5">New Image</p>
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Reference preview"
                                            className="w-full max-w-sm h-32 object-cover rounded border"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6"
                                            onClick={removeImage}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </>
                            )}
                            {errors.reference_image && <p className="text-xs text-destructive">{errors.reference_image}</p>}
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
                                Record Payment
                            </Button>
                            <Link href={payments.index.url()}>
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

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Payments', href: '/payments' },
            { title: 'Create', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
