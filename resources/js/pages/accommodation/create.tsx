import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import accommodations from '@/routes/accommodations';

export default function Create() {
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'room' as 'room' | 'cottage',
        size: 'small' as 'small' | 'big',
        description: '',
        is_air_conditioned: false,
        images: [] as File[],
        min_capacity: '',
        max_capacity: '',
        is_active: true,
        sort_order: '0',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        setData('images', [...data.images, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        const newImages = data.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);

        setData('images', newImages);
        setImagePreviews(newPreviews);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(accommodations.store.url(), { forceFormData: true });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={accommodations.index.url()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">Create Accommodation</h1>
                    <p className="text-sm text-muted-foreground">Add a new room or cottage</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Accommodation Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-sm cursor-text select-text">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="h-9"
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="type" className="text-sm cursor-text select-text">Type</Label>
                                <Select value={data.type} onValueChange={(value: 'room' | 'cottage') => setData('type', value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="room">Room</SelectItem>
                                        <SelectItem value="cottage">Cottage</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="size" className="text-sm cursor-text select-text">Size</Label>
                                <Select value={data.size} onValueChange={(value: 'small' | 'big') => setData('size', value)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="small">Small</SelectItem>
                                        <SelectItem value="big">Big</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.size && <p className="text-xs text-destructive">{errors.size}</p>}
                            </div>

                            <div className="flex items-end space-x-2 pb-1">
                                <Switch
                                    id="is_air_conditioned"
                                    checked={data.is_air_conditioned}
                                    onCheckedChange={(checked) => setData('is_air_conditioned', checked)}
                                />
                                <Label htmlFor="is_air_conditioned" className="text-sm cursor-pointer select-text">
                                    Air Conditioned
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-sm cursor-text select-text">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={2}
                                className="resize-none"
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="images" className="text-sm cursor-text select-text">Images</Label>
                            <Input
                                id="images"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                multiple
                                onChange={handleImageChange}
                                className="h-9"
                            />
                            {errors.images && <p className="text-xs text-destructive">{errors.images}</p>}

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-5 gap-2 pt-2">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-20 object-cover rounded border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => removeImage(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="min_capacity" className="text-sm cursor-text select-text">Min Capacity</Label>
                                <Input
                                    id="min_capacity"
                                    type="number"
                                    min="1"
                                    value={data.min_capacity}
                                    onChange={(e) => setData('min_capacity', e.target.value)}
                                    className="h-9"
                                />
                                {errors.min_capacity && <p className="text-xs text-destructive">{errors.min_capacity}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="max_capacity" className="text-sm cursor-text select-text">Max Capacity</Label>
                                <Input
                                    id="max_capacity"
                                    type="number"
                                    min="1"
                                    value={data.max_capacity}
                                    onChange={(e) => setData('max_capacity', e.target.value)}
                                    className="h-9"
                                />
                                {errors.max_capacity && <p className="text-xs text-destructive">{errors.max_capacity}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="sort_order" className="text-sm cursor-text select-text">Sort Order</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                    className="h-9"
                                />
                                {errors.sort_order && <p className="text-xs text-destructive">{errors.sort_order}</p>}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked)}
                            />
                            <Label htmlFor="is_active" className="text-sm cursor-pointer select-text">Active</Label>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={processing} size="sm">
                                Create
                            </Button>
                            <Link href={accommodations.index.url()}>
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
            { title: 'Accommodations', href: '/accommodations' },
            { title: 'Create', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
