import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type PageProps } from '@/types';

export default function Create({}: PageProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        type: 'bank' as 'bank' | 'gcash' | 'maya' | 'other',
        account_name: '',
        account_number: '',
        bank_name: '',
        qr_code: null as File | null,
        is_active: true,
        sort_order: 0,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('qr_code', file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('qr_code', null);
        setImagePreview(null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/payment-accounts', {
            forceFormData: true,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href="/payment-accounts">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">Create Payment Account</h1>
                    <p className="text-sm text-muted-foreground">Add a new payment account</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Account Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="type" className="text-sm cursor-text select-text">
                                    Payment Type
                                </Label>
                                <Select value={data.type} onValueChange={(value: any) => setData('type', value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank">Bank</SelectItem>
                                        <SelectItem value="gcash">GCash</SelectItem>
                                        <SelectItem value="maya">Maya</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="account_name" className="text-sm cursor-text select-text">
                                    Account Name
                                </Label>
                                <Input
                                    id="account_name"
                                    value={data.account_name}
                                    onChange={(e) => setData('account_name', e.target.value)}
                                    placeholder="Juan Dela Cruz"
                                    className="h-9"
                                />
                                {errors.account_name && <p className="text-xs text-destructive">{errors.account_name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="account_number" className="text-sm cursor-text select-text">
                                    Account Number
                                </Label>
                                <Input
                                    id="account_number"
                                    value={data.account_number}
                                    onChange={(e) => setData('account_number', e.target.value)}
                                    placeholder="1234567890"
                                    className="h-9"
                                />
                                {errors.account_number && <p className="text-xs text-destructive">{errors.account_number}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="bank_name" className="text-sm cursor-text select-text">
                                    Bank Name
                                </Label>
                                <Input
                                    id="bank_name"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                    placeholder="BDO, BPI, etc."
                                    className="h-9"
                                />
                                {errors.bank_name && <p className="text-xs text-destructive">{errors.bank_name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="sort_order" className="text-sm cursor-text select-text">
                                    Sort Order
                                </Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="h-9"
                                />
                                {errors.sort_order && <p className="text-xs text-destructive">{errors.sort_order}</p>}
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active" className="text-sm cursor-pointer">
                                    Active
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm cursor-text select-text">QR Code (Optional)</Label>
                            {!imagePreview ? (
                                <div className="border-2 border-dashed rounded p-4 text-center">
                                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                    <Input
                                        id="qr_code"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <Label htmlFor="qr_code" className="cursor-pointer">
                                        <span className="text-xs text-primary hover:underline">Click to upload</span>
                                    </Label>
                                </div>
                            ) : (
                                <div className="relative inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="QR Code preview"
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
                            {errors.qr_code && <p className="text-xs text-destructive">{errors.qr_code}</p>}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={processing} size="sm">
                                Create Account
                            </Button>
                            <Link href="/payment-accounts">
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
            { title: 'Payment Accounts', href: '/payment-accounts' },
            { title: 'Create', href: '#' },
        ]}
    >
        <div className="p-4">{page}</div>
    </AppLayout>
);
