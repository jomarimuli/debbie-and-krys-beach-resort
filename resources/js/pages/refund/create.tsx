// resources/js/pages/refund/create.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, RefreshCw, LoaderCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Payment, type Rebooking, type PaymentAccount, type PageProps } from '@/types';
import { format } from 'date-fns';
import refunds from '@/routes/refunds';

export default function Create({
    payments,
    rebookings,
    payment_accounts,
    preselected_rebooking_id
}: PageProps & {
    payments: Payment[];
    rebookings?: Rebooking[];
    payment_accounts: PaymentAccount[];
    preselected_rebooking_id?: number;
}) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [refundType, setRefundType] = useState<'payment' | 'rebooking'>('payment');

    const { data, setData, post, processing, errors } = useForm({
        payment_id: '',
        rebooking_id: '',
        amount: '',
        refund_method: 'cash' as 'cash' | 'bank' | 'gcash' | 'maya' | 'original_method' | 'other',
        is_rebooking_refund: false,
        refund_account_id: '',
        reference_number: '',
        reference_image: null as File | null,
        reason: '',
        notes: '',
        refund_date: format(new Date(), 'yyyy-MM-dd'),
    });

    const selectedPayment = payments.find((p) => p.id === parseInt(data.payment_id));
    const selectedRebooking = rebookings?.find((r) => r.id === parseInt(data.rebooking_id));

    useEffect(() => {
        if (refundType === 'payment') {
            setData({
                ...data,
                rebooking_id: '',
                is_rebooking_refund: false,
            });
        } else {
            setData({
                ...data,
                is_rebooking_refund: true,
            });
        }
    }, [refundType]);

    // Auto-set payment_id when rebooking is selected (use first payment from original booking)
    useEffect(() => {
        if (selectedRebooking && selectedRebooking.original_booking?.payments && selectedRebooking.original_booking.payments.length > 0) {
            const firstPayment = selectedRebooking.original_booking.payments[0];
            setData({
                ...data,
                payment_id: firstPayment.id.toString(),
            });
        }
    }, [data.rebooking_id]);

    // for preselection
    useEffect(() => {
        if (preselected_rebooking_id && rebookings) {
            setRefundType('rebooking');
            setData('rebooking_id', preselected_rebooking_id.toString());
        }
    }, [preselected_rebooking_id]);

    const filteredAccounts = payment_accounts.filter(
        (account) => account.type === data.refund_method && account.is_active
    );

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
        post(refunds.store.url(), {
            forceFormData: true,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={refunds.index.url()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">Process Refund</h1>
                    <p className="text-sm text-muted-foreground">Create a new refund record</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Refund Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={refundType === 'payment' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setRefundType('payment')}
                        >
                            Payment Refund
                        </Button>
                        {rebookings && rebookings.length > 0 && (
                            <Button
                                type="button"
                                variant={refundType === 'rebooking' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setRefundType('rebooking')}
                            >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Rebooking Refund
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Refund Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        {refundType === 'payment' ? (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="payment_id" className="text-sm cursor-text select-text">Payment</Label>
                                    <Select value={data.payment_id} onValueChange={(value) => setData('payment_id', value)}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select payment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {payments.map((payment) => (
                                                <SelectItem key={payment.id} value={payment.id.toString()}>
                                                    {payment.payment_number} - {payment.booking?.guest_name} (Remaining: ₱
                                                    {parseFloat(payment.remaining_amount || payment.amount).toLocaleString()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_id && <p className="text-xs text-destructive">{errors.payment_id}</p>}
                                </div>

                                {selectedPayment && (
                                    <div className="rounded border p-3 bg-muted/30 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Guest:</span>
                                            <span className="font-medium">{selectedPayment.booking?.guest_name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Payment Amount:</span>
                                            <span className="font-medium">
                                                ₱{parseFloat(selectedPayment.amount).toLocaleString()}
                                            </span>
                                        </div>
                                        {selectedPayment.refunded_amount && parseFloat(selectedPayment.refunded_amount) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Already Refunded:</span>
                                                <span className="font-medium text-red-600">
                                                    ₱{parseFloat(selectedPayment.refunded_amount).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm border-t pt-2">
                                            <span className="font-semibold">Available to Refund:</span>
                                            <span className="font-semibold text-green-600">
                                                ₱{parseFloat(selectedPayment.remaining_amount || selectedPayment.amount).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
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
                                                    {Math.abs(parseFloat(rebooking.remaining_refund || '0')).toLocaleString()})
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
                                            <span className="font-medium text-red-600">
                                                -₱{Math.abs(parseFloat(selectedRebooking.total_adjustment)).toLocaleString()}
                                            </span>
                                        </div>
                                        {selectedRebooking.total_refunded && parseFloat(selectedRebooking.total_refunded) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Already Refunded:</span>
                                                <span className="font-medium text-red-600">
                                                    ₱{parseFloat(selectedRebooking.total_refunded).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm border-t pt-2">
                                            <span className="font-semibold">Remaining Refund:</span>
                                            <span className="font-semibold text-red-600">
                                                ₱{Math.abs(parseFloat(selectedRebooking.remaining_refund || '0')).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="amount" className="text-sm cursor-text select-text">Refund Amount</Label>
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
                                <Label htmlFor="refund_method" className="text-sm cursor-text select-text">Refund Method</Label>
                                <Select
                                    value={data.refund_method}
                                    onValueChange={(value: any) => {
                                        setData('refund_method', value);
                                        setData('refund_account_id', '');
                                    }}
                                >
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank">Bank</SelectItem>
                                        <SelectItem value="gcash">GCash</SelectItem>
                                        <SelectItem value="maya">Maya</SelectItem>
                                        <SelectItem value="original_method">Original Method</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.refund_method && <p className="text-xs text-destructive">{errors.refund_method}</p>}
                            </div>

                            {filteredAccounts.length > 0 && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="refund_account_id" className="text-sm cursor-text select-text">
                                        Refund Account (Optional)
                                    </Label>
                                    <Select
                                        value={data.refund_account_id || 'none'}
                                        onValueChange={(value) => setData('refund_account_id', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {filteredAccounts.map((account) => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.account_name} {account.account_number && `- ${account.account_number}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.refund_account_id && <p className="text-xs text-destructive">{errors.refund_account_id}</p>}
                                </div>
                            )}

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
                                <Label htmlFor="refund_date" className="text-sm cursor-text select-text">Refund Date</Label>
                                <Input
                                    id="refund_date"
                                    type="date"
                                    value={data.refund_date}
                                    onChange={(e) => setData('refund_date', e.target.value)}
                                    className="h-9"
                                />
                                {errors.refund_date && <p className="text-xs text-destructive">{errors.refund_date}</p>}
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
                            )}
                            {errors.reference_image && <p className="text-xs text-destructive">{errors.reference_image}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="reason" className="text-sm cursor-text select-text">Reason</Label>
                            <Textarea
                                id="reason"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                rows={2}
                                className="resize-none"
                                placeholder="Reason for refund"
                            />
                            {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
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
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Process Refund
                            </Button>
                            <Link href={refunds.index.url()}>
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
            { title: 'Refunds', href: '/refunds' },
            { title: 'Create', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
