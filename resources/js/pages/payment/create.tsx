// resources/js/pages/payment/create.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function Create({ bookings }: PageProps & { bookings: Booking[] }) {
    const { data, setData, post, processing, errors } = useForm({
        booking_id: '',
        amount: '',
        payment_method: 'cash' as 'cash' | 'card' | 'bank_transfer' | 'gcash' | 'other',
        reference_number: '',
        notes: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
    });

    const selectedBooking = bookings.find((b) => b.id === parseInt(data.booking_id));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/payments');
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <Link href="/payments">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Record Payment</h1>
                    <p className="text-muted-foreground">Add a new payment record</p>
                </div>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Enter payment information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="booking_id">Booking *</Label>
                                <Select value={data.booking_id} onValueChange={(value) => setData('booking_id', value)}>
                                    <SelectTrigger>
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
                                {errors.booking_id && <p className="text-sm text-destructive">{errors.booking_id}</p>}
                            </div>

                            {selectedBooking && (
                                <div className="md:col-span-2 rounded-lg border p-4 bg-muted/50">
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Guest:</span>
                                            <span className="font-medium">{selectedBooking.guest_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Amount:</span>
                                            <span className="font-medium">
                                                ₱{parseFloat(selectedBooking.total_amount).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Paid Amount:</span>
                                            <span className="font-medium text-green-600">
                                                ₱{parseFloat(selectedBooking.paid_amount).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-semibold">Remaining Balance:</span>
                                            <span className="font-semibold text-red-600">
                                                ₱{parseFloat(selectedBooking.balance).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="0.00"
                                />
                                {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_method">Payment Method *</Label>
                                <Select value={data.payment_method} onValueChange={(value: any) => setData('payment_method', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="gcash">GCash</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.payment_method && <p className="text-sm text-destructive">{errors.payment_method}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reference_number">Reference Number</Label>
                                <Input
                                    id="reference_number"
                                    value={data.reference_number}
                                    onChange={(e) => setData('reference_number', e.target.value)}
                                    placeholder="Transaction reference"
                                />
                                {errors.reference_number && <p className="text-sm text-destructive">{errors.reference_number}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_date">Payment Date *</Label>
                                <Input
                                    id="payment_date"
                                    type="date"
                                    value={data.payment_date}
                                    onChange={(e) => setData('payment_date', e.target.value)}
                                />
                                {errors.payment_date && <p className="text-sm text-destructive">{errors.payment_date}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Additional payment notes..."
                                    rows={3}
                                />
                                {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                Record Payment
                            </Button>
                            <Link href="/payments">
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Payments', href: '/payments' },
            { title: 'Create', href: '/payments/create' },
        ]}
    >
        {page}
    </AppLayout>
);
