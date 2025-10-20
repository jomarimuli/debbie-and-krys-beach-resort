// resources/js/pages/accommodation/create.tsx
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'room' as 'room' | 'cottage',
        description: '',
        min_capacity: '',
        max_capacity: '',
        quantity_available: '1',
        is_active: true,
        sort_order: '0',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/accommodations');
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <Link href="/accommodations">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create Accommodation</h1>
                    <p className="text-muted-foreground">Add a new room or cottage</p>
                </div>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Accommodation Details</CardTitle>
                    <CardDescription>Enter the details for the new accommodation</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Big Room (Airconditioned)"
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select value={data.type} onValueChange={(value: 'room' | 'cottage') => setData('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="room">Room</SelectItem>
                                        <SelectItem value="cottage">Cottage</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief description of the accommodation"
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="min_capacity">Min Capacity (pax)</Label>
                                <Input
                                    id="min_capacity"
                                    type="number"
                                    min="1"
                                    value={data.min_capacity}
                                    onChange={(e) => setData('min_capacity', e.target.value)}
                                    placeholder="e.g., 8"
                                />
                                {errors.min_capacity && <p className="text-sm text-destructive">{errors.min_capacity}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_capacity">Max Capacity (pax)</Label>
                                <Input
                                    id="max_capacity"
                                    type="number"
                                    min="1"
                                    value={data.max_capacity}
                                    onChange={(e) => setData('max_capacity', e.target.value)}
                                    placeholder="e.g., 15"
                                />
                                {errors.max_capacity && <p className="text-sm text-destructive">{errors.max_capacity}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity_available">Quantity Available *</Label>
                                <Input
                                    id="quantity_available"
                                    type="number"
                                    min="1"
                                    value={data.quantity_available}
                                    onChange={(e) => setData('quantity_available', e.target.value)}
                                />
                                {errors.quantity_available && <p className="text-sm text-destructive">{errors.quantity_available}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                />
                                {errors.sort_order && <p className="text-sm text-destructive">{errors.sort_order}</p>}
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
                                Create Accommodation
                            </Button>
                            <Link href="/accommodations">
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
            { title: 'Accommodations', href: '/accommodations' },
            { title: 'Create', href: '/accommodations/create' },
        ]}
    >
        {page}
    </AppLayout>
);
