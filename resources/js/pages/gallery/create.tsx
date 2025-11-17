import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { type PageProps } from '@/types';
import galleries from '@/routes/galleries';

export default function Create({}: PageProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        image: null as File | null,
        is_active: true,
        sort_order: 0,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(galleries.store.url(), {
            forceFormData: true,
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link href={galleries.index.url()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">Add Gallery Image</h1>
                    <p className="text-sm text-muted-foreground">Upload a new image to gallery</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium">Image Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="image" className="text-sm cursor-text select-text">
                                Image
                            </Label>
                            {!imagePreview ? (
                                <div className="border-2 border-dashed rounded p-6 text-center">
                                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <Label htmlFor="image" className="cursor-pointer">
                                        <span className="text-sm text-primary hover:underline">
                                            Click to upload image
                                        </span>
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JPEG, PNG, or WebP (Max 2MB)
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-muted-foreground mb-1.5">New Image</p>
                                    <div className="relative inline-block max-w-md">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-64 object-cover rounded border"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 h-8 w-8"
                                            onClick={removeImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                            {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="title" className="text-sm cursor-text select-text">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="h-9"
                            />
                            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-sm cursor-text select-text">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={2}
                                className="resize-none"
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="sort_order" className="text-sm cursor-text select-text">
                                Sort Order
                            </Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min="0"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                className="h-9"
                            />
                            {errors.sort_order && <p className="text-xs text-destructive">{errors.sort_order}</p>}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked)}
                            />
                            <Label htmlFor="is_active" className="text-sm cursor-pointer select-text">
                                Active
                            </Label>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={processing} size="sm">
                                Add Image
                            </Button>
                            <Link href={galleries.index.url()}>
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
            { title: 'Gallery', href: '/galleries' },
            { title: 'Create', href: '#' },
        ]}
    >
        <div className="p-4">
            {page}
        </div>
    </AppLayout>
);
