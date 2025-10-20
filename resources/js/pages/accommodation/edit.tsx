import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type Accommodation, type PageProps } from '@/types';

export default function Edit({ accommodation }: PageProps & { accommodation: Accommodation }) {
    const [existingImages, setExistingImages] = useState<string[]>(accommodation.images || []);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: accommodation.name,
        type: accommodation.type,
        description: accommodation.description || '',
        is_air_conditioned: accommodation.is_air_conditioned,
        images: [] as File[],
        existing_images: accommodation.images || [],
        min_capacity: accommodation.min_capacity?.toString() || '',
        max_capacity: accommodation.max_capacity?.toString() || '',
        quantity_available: accommodation.quantity_available.toString(),
        is_active: accommodation.is_active,
        sort_order: accommodation.sort_order.toString(),
        _method: 'PUT',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        const totalImages = existingImages.length + data.images.length + files.length;
        if (totalImages > 5) {
            alert('Maximum 5 images allowed');
            return;
        }

        setData('images', [...data.images, ...files]);

        // Generate previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index: number) => {
        const newExisting = existingImages.filter((_, i) => i !== index);
        setExistingImages(newExisting);
        setData('existing_images', newExisting);
    };

    const removeNewImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = newImagePreviews.filter((_, i) => i !== index);

        setData('images', newImages);
        setNewImagePreviews(newPreviews);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/accommodations/${accommodation.id}`, {
            forceFormData: true,
        });
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
                    <h1 className="text-2xl font-bold tracking-tight">Edit Accommodation</h1>
                    <p className="text-muted-foreground">{accommodation.name}</p>
                </div>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Accommodation Details</CardTitle>
                    <CardDescription>Update the accommodation information</CardDescription>
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
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_air_conditioned"
                                    checked={data.is_air_conditioned}
                                    onCheckedChange={(checked) => setData('is_air_conditioned', checked)}
                                />
                                <Label htmlFor="is_air_conditioned">Air Conditioned</Label>
                            </div>
                        </div>

                        {/* Image Management Section */}
                        <div className="space-y-4">
                            <div>
                                <Label>Current Images</Label>
                                {existingImages.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                                        {existingImages.map((imagePath, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={`/storage/${imagePath}`}
                                                    alt={`Current ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeExistingImage(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground mt-2">No images uploaded</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="images">Add New Images (Max 5 total)</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Upload images in JPEG, PNG, or WebP format
                                </p>
                                <Input
                                    id="images"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    multiple
                                    onChange={handleImageChange}
                                    disabled={existingImages.length + data.images.length >= 5}
                                />
                                {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
                            </div>

                            {newImagePreviews.length > 0 && (
                                <div>
                                    <Label>New Images (Not saved yet)</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                                        {newImagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`New ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeNewImage(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="min_capacity">Min Capacity (pax)</Label>
                                <Input
                                    id="min_capacity"
                                    type="number"
                                    min="1"
                                    value={data.min_capacity}
                                    onChange={(e) => setData('min_capacity', e.target.value)}
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
                                Update Accommodation
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

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Accommodations', href: '/accommodations' },
            { title: 'Edit', href: '#' },
        ]}
    >
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {page}
        </div>
    </AppLayout>
);
