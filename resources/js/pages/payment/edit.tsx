import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Payment, type PageProps } from '@/types';
import { format } from 'date-fns';

export default function Edit({ payment }: PageProps & { payment: Payment }) {
    const [currentImage, setCurrentImage] = useState<string | null>(payment.reference_image_url);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        amount: payment.amount,
        payment_method: payment.payment_method,
        reference_number: payment.reference_number || '',
        reference_image: null as File | null,
        remove_reference_image: false,
        notes: payment.notes || '',
        payment_date: format(new Date(payment.payment_date), 'yyyy-MM-dd'),
        _method: 'PUT',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('reference_image', file);
            setData('remove_reference_image', false);

            // Generate preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeCurrentImage = () => {
        setCurrentImage(null);
        setData('remove_reference_image', true);
    };

    const removeNewImage = () => {
        setData('reference_image', null);
        setNewImagePreview(null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/payments/${payment.id}`, {
            forceFormData: true,
        });
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

                            {/* Reference Image Management */}
                            <div className="space-y-2 md:col-span-2">
                                <Label>Reference Image</Label>

                                {/* Current Image */}
                                {currentImage && !data.remove_reference_image && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Current Image</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={currentImage}
                                                alt="Current reference"
                                                className="w-full max-w-md h-48 object-cover rounded-lg border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8"
                                                onClick={removeCurrentImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* New Image Upload */}
                                {(!currentImage || data.remove_reference_image) && !newImagePreview && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Upload new reference image (JPEG, PNG, or WebP - Max 2MB)
                                        </p>
                                        <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                            <Input
                                                id="reference_image"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <Label htmlFor="reference_image" className="cursor-pointer">
                                                <span className="text-sm text-primary hover:underline">
                                                    Click to upload
                                                </span>
                                            </Label>
                                        </div>
                                    </div>
                                )}

                                {/* New Image Preview */}
                                {newImagePreview && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">New Image (Not saved yet)</p>
                                        <div className="relative inline-block">
                                            <img
                                                src={newImagePreview}
                                                alt="New reference preview"
                                                className="w-full max-w-md h-48 object-cover rounded-lg border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8"
                                                onClick={removeNewImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {errors.reference_image && <p className="text-sm text-destructive">{errors.reference_image}</p>}
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
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {page}
        </div>
    </AppLayout>
);
