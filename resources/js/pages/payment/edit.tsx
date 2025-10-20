// resources/js/pages/payment/edit.tsx
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
import { type Payment, type PageProps } from '@/types';
import { format } from 'date-fns';

export default function Edit({ payment }: PageProps & { payment: Payment }) {
    const { data, setData, put, processing, errors } = useForm({
        amount: payment.amount,
        payment_method: payment.payment_method,
        reference_number: payment.reference_number || '',
        notes: payment.notes || '',
        payment_date: format(new Date(payment.payment_date), 'yyyy-MM-dd'),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/payments/${payment.id}`);
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <Link href={`/payments/${payment.id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Payment</h1>
                    <p className="text-muted-foreground">{payment.payment_number}</p>
                </div>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Update payment information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
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
                                    rows={3}
                                />
                                {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                Update Payment
                            </Button>
                            <Link href={`/payments/${payment.id}`}>
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

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Payments', href: '/payments' },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
