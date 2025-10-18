// resources/js/pages/rooms/create-room-modal.tsx
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { type RoomFormData } from '@/types';
import { LoaderCircle, Upload, X } from 'lucide-react';
import rooms from '@/routes/rooms';

interface CreateRoomModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateRoomModal({ open, onOpenChange }: CreateRoomModalProps) {
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<RoomFormData>({
        name: '',
        size: 'big',
        description: null,
        max_pax: 1,
        day_tour_price: 0,
        overnight_price: null,
        quantity: 1,
        has_ac: false,
        free_entrance_count: 0,
        free_cottage_size: null,
        excess_pax_fee: 0,
        images: null,
        is_active: true,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setData('images', files as any);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleRemoveImage = (index: number) => {
        const newImages = Array.from(data.images || []).filter((_, i) => i !== index);
        setData('images', newImages.length > 0 ? newImages as any : null);

        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(rooms.store.url(), {
            onSuccess: () => {
                reset();
                setImagePreviews([]);
                onOpenChange(false);
            },
        });
    };

    const handleCancel = () => {
        reset();
        setImagePreviews([]);
        onOpenChange(false);
    };

    const canSubmit = data.name && data.max_pax > 0 && data.day_tour_price >= 0 && !processing;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Room Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter room name"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="size">Room Size</Label>
                        <Select value={data.size} onValueChange={(value) => setData('size', value)}>
                            <SelectTrigger className={errors.size ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="big">Big</SelectItem>
                                <SelectItem value="small">Small</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.size && (
                            <p className="text-sm text-red-600">{errors.size}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description || ''}
                            onChange={(e) => setData('description', e.target.value || null)}
                            placeholder="Enter room description"
                            rows={3}
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="max_pax">Max Pax</Label>
                            <Input
                                id="max_pax"
                                type="number"
                                min="1"
                                value={data.max_pax}
                                onChange={(e) => setData('max_pax', parseInt(e.target.value))}
                                className={errors.max_pax ? 'border-red-500' : ''}
                            />
                            {errors.max_pax && (
                                <p className="text-sm text-red-600">{errors.max_pax}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="0"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', parseInt(e.target.value))}
                                className={errors.quantity ? 'border-red-500' : ''}
                            />
                            {errors.quantity && (
                                <p className="text-sm text-red-600">{errors.quantity}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="day_tour_price">Day Tour Price (₱)</Label>
                            <Input
                                id="day_tour_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.day_tour_price}
                                onChange={(e) => setData('day_tour_price', parseFloat(e.target.value))}
                                className={errors.day_tour_price ? 'border-red-500' : ''}
                            />
                            {errors.day_tour_price && (
                                <p className="text-sm text-red-600">{errors.day_tour_price}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="overnight_price">Overnight Price (₱)</Label>
                            <Input
                                id="overnight_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.overnight_price || ''}
                                onChange={(e) => setData('overnight_price', e.target.value ? parseFloat(e.target.value) : null)}
                                placeholder="Optional"
                                className={errors.overnight_price ? 'border-red-500' : ''}
                            />
                            {errors.overnight_price && (
                                <p className="text-sm text-red-600">{errors.overnight_price}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="free_entrance_count">Free Entrance Count</Label>
                            <Input
                                id="free_entrance_count"
                                type="number"
                                min="0"
                                value={data.free_entrance_count}
                                onChange={(e) => setData('free_entrance_count', parseInt(e.target.value))}
                                className={errors.free_entrance_count ? 'border-red-500' : ''}
                            />
                            {errors.free_entrance_count && (
                                <p className="text-sm text-red-600">{errors.free_entrance_count}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="excess_pax_fee">Excess Pax Fee (₱)</Label>
                            <Input
                                id="excess_pax_fee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.excess_pax_fee}
                                onChange={(e) => setData('excess_pax_fee', parseFloat(e.target.value))}
                                className={errors.excess_pax_fee ? 'border-red-500' : ''}
                            />
                            {errors.excess_pax_fee && (
                                <p className="text-sm text-red-600">{errors.excess_pax_fee}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="free_cottage_size">Free Cottage Size</Label>
                        <Select
                            value={data.free_cottage_size || ''}
                            onValueChange={(value) => setData('free_cottage_size', value || null)}
                        >
                            <SelectTrigger className={errors.free_cottage_size ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select cottage size (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="big">Big</SelectItem>
                                <SelectItem value="small">Small</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.free_cottage_size && (
                            <p className="text-sm text-red-600">{errors.free_cottage_size}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="images">Room Images</Label>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('images')?.click()}
                                className="w-full"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Images
                            </Button>
                            <input
                                id="images"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                        {errors.images && (
                            <p className="text-sm text-red-600">{errors.images}</p>
                        )}

                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="has_ac"
                            checked={data.has_ac}
                            onCheckedChange={(checked) => setData('has_ac', checked as boolean)}
                        />
                        <Label htmlFor="has_ac" className="text-sm cursor-pointer">
                            Air Conditioned
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                        />
                        <Label htmlFor="is_active" className="text-sm cursor-pointer">
                            Active Status
                        </Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canSubmit}>
                            {processing && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                            Create Room
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
