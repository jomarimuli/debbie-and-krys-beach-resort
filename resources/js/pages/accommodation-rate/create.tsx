// resources/js/pages/accommodation-rate/create.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Accommodation, type PageProps } from '@/types';

export default function Create({ accommodations }: PageProps & { accommodations: Accommodation[] }) {
    const { data, setData, post, processing, errors } = useForm({
        accommodation_id: '',
        booking_type: 'day_tour' as 'day_tour' | 'overnight',
        rate: '',
        base_capacity: '',
        additional_pax_rate: '',
        entrance_fee: '',
        child_entrance_fee: '',
        child_max_age: '5',
        includes_free_cottage: false,
        includes_free_entrance: false,
        effective_from: '',
        effective_to: '',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/accommodation-rates');
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <Link href="/accommodation-rates">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Accommodation Rate</h1>
                    <p className="text-muted-foreground">Add a new pricing rate</p>
                </div>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Rate Details</CardTitle>
                    <CardDescription>Configure pricing for accommodation</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="accommodation_id">Accommodation *</Label>
                                <Select value={data.accommodation_id} onValueChange={(value) => setData('accommodation_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select accommodation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accommodations.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>
                                                {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.accommodation_id && <p className="text-sm text-destructive">{errors.accommodation_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="booking_type">Booking Type *</Label>
                                <Select value={data.booking_type} onValueChange={(value: 'day_tour' | 'overnight') => setData('booking_type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="day_tour">Day Tour</SelectItem>
                                        <SelectItem value="overnight">Overnight</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.booking_type && <p className="text-sm text-destructive">{errors.booking_type}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rate">Rate (₱) *</Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.rate}
                                    onChange={(e) => setData('rate', e.target.value)}
                                    placeholder="e.g., 4500"
                                />
                                {errors.rate && <p className="text-sm text-destructive">{errors.rate}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="base_capacity">Base Capacity (pax)</Label>
                                <Input
                                    id="base_capacity"
                                    type="number"
                                    min="1"
                                    value={data.base_capacity}
                                    onChange={(e) => setData('base_capacity', e.target.value)}
                                    placeholder="e.g., 6"
                                />
                                {errors.base_capacity && <p className="text-sm text-destructive">{errors.base_capacity}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="additional_pax_rate">Additional Pax Rate (₱)</Label>
                                <Input
                                    id="additional_pax_rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.additional_pax_rate}
                                    onChange={(e) => setData('additional_pax_rate', e.target.value)}
                                    placeholder="e.g., 150"
                                />
                                {errors.additional_pax_rate && <p className="text-sm text-destructive">{errors.additional_pax_rate}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="entrance_fee">Entrance Fee (₱)</Label>
                                <Input
                                    id="entrance_fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.entrance_fee}
                                    onChange={(e) => setData('entrance_fee', e.target.value)}
                                    placeholder="e.g., 100"
                                />
                                {errors.entrance_fee && <p className="text-sm text-destructive">{errors.entrance_fee}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="child_entrance_fee">Child Entrance Fee (₱)</Label>
                                <Input
                                    id="child_entrance_fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.child_entrance_fee}
                                    onChange={(e) => setData('child_entrance_fee', e.target.value)}
                                    placeholder="e.g., 50"
                                />
                                {errors.child_entrance_fee && <p className="text-sm text-destructive">{errors.child_entrance_fee}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="child_max_age">Child Max Age (years)</Label>
                                <Input
                                    id="child_max_age"
                                    type="number"
                                    min="1"
                                    max="17"
                                    value={data.child_max_age}
                                    onChange={(e) => setData('child_max_age', e.target.value)}
                                />
                                {errors.child_max_age && <p className="text-sm text-destructive">{errors.child_max_age}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="effective_from">Effective From</Label>
                                <Input
                                    id="effective_from"
                                    type="date"
                                    value={data.effective_from}
                                    onChange={(e) => setData('effective_from', e.target.value)}
                                />
                                {errors.effective_from && <p className="text-sm text-destructive">{errors.effective_from}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="effective_to">Effective To</Label>
                                <Input
                                    id="effective_to"
                                    type="date"
                                    value={data.effective_to}
                                    onChange={(e) => setData('effective_to', e.target.value)}
                                />
                                {errors.effective_to && <p className="text-sm text-destructive">{errors.effective_to}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="includes_free_cottage"
                                    checked={data.includes_free_cottage}
                                    onCheckedChange={(checked) => setData('includes_free_cottage', checked)}
                                />
                                <Label htmlFor="includes_free_cottage">Includes Free Cottage</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="includes_free_entrance"
                                    checked={data.includes_free_entrance}
                                    onCheckedChange={(checked) => setData('includes_free_entrance', checked)}
                                />
                                <Label htmlFor="includes_free_entrance">Includes Free Entrance</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={processing}>
                                Create Rate
                            </Button>
                            <Link href="/accommodation-rates">
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
            { title: 'Accommodation Rates', href: '/accommodation-rates' },
            { title: 'Create', href: '#' },
        ]}
    >
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            {page}
        </div>
    </AppLayout>
);
