import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Accommodation, type PageProps } from '@/types';
import accommodationRates from '@/routes/accommodation-rates';

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
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(accommodationRates.store.url());
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={accommodationRates.index.url()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">Create Accommodation Rate</h1>
                    <p className="text-sm text-muted-foreground">Add a new pricing rate</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Rate Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="accommodation_id" className="text-sm cursor-text select-text">Accommodation</Label>
                                <Select value={data.accommodation_id} onValueChange={(value) => setData('accommodation_id', value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accommodations.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id.toString()}>
                                                {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.accommodation_id && <p className="text-xs text-destructive">{errors.accommodation_id}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="booking_type" className="text-sm cursor-text select-text">Booking Type</Label>
                                <Select value={data.booking_type} onValueChange={(value: 'day_tour' | 'overnight') => setData('booking_type', value)}>
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
                                <Label htmlFor="rate" className="text-sm cursor-text select-text">Rate (₱)</Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.rate}
                                    onChange={(e) => setData('rate', e.target.value)}
                                    className="h-9"
                                />
                                {errors.rate && <p className="text-xs text-destructive">{errors.rate}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="base_capacity" className="text-sm cursor-text select-text">Base Capacity (pax)</Label>
                                <Input
                                    id="base_capacity"
                                    type="number"
                                    min="1"
                                    value={data.base_capacity}
                                    onChange={(e) => setData('base_capacity', e.target.value)}
                                    className="h-9"
                                />
                                {errors.base_capacity && <p className="text-xs text-destructive">{errors.base_capacity}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="additional_pax_rate" className="text-sm cursor-text select-text">Additional Pax Rate (₱)</Label>
                                <Input
                                    id="additional_pax_rate"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.additional_pax_rate}
                                    onChange={(e) => setData('additional_pax_rate', e.target.value)}
                                    className="h-9"
                                />
                                {errors.additional_pax_rate && <p className="text-xs text-destructive">{errors.additional_pax_rate}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="entrance_fee" className="text-sm cursor-text select-text">Entrance Fee (₱)</Label>
                                <Input
                                    id="entrance_fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.entrance_fee}
                                    onChange={(e) => setData('entrance_fee', e.target.value)}
                                    className="h-9"
                                />
                                {errors.entrance_fee && <p className="text-xs text-destructive">{errors.entrance_fee}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="child_entrance_fee" className="text-sm cursor-text select-text">Child Entrance Fee (₱)</Label>
                                <Input
                                    id="child_entrance_fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.child_entrance_fee}
                                    onChange={(e) => setData('child_entrance_fee', e.target.value)}
                                    className="h-9"
                                />
                                {errors.child_entrance_fee && <p className="text-xs text-destructive">{errors.child_entrance_fee}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="child_max_age" className="text-sm cursor-text select-text">Child Max Age (years)</Label>
                                <Input
                                    id="child_max_age"
                                    type="number"
                                    min="1"
                                    max="17"
                                    value={data.child_max_age}
                                    onChange={(e) => setData('child_max_age', e.target.value)}
                                    className="h-9"
                                />
                                {errors.child_max_age && <p className="text-xs text-destructive">{errors.child_max_age}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="includes_free_cottage"
                                    checked={data.includes_free_cottage}
                                    onCheckedChange={(checked) => setData('includes_free_cottage', checked)}
                                />
                                <Label htmlFor="includes_free_cottage" className="text-sm cursor-pointer select-text">
                                    Includes Free Cottage
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="includes_free_entrance"
                                    checked={data.includes_free_entrance}
                                    onCheckedChange={(checked) => setData('includes_free_entrance', checked)}
                                />
                                <Label htmlFor="includes_free_entrance" className="text-sm cursor-pointer select-text">
                                    Includes Free Entrance
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active" className="text-sm cursor-pointer select-text">Active</Label>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={processing} size="sm">
                                Create Rate
                            </Button>
                            <Link href={accommodationRates.index.url()}>
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
            { title: 'Accommodation Rates', href: '/accommodation-rates' },
            { title: 'Create', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
