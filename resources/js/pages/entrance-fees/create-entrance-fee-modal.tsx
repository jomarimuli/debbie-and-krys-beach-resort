// resources/js/pages/entrance-fees/create-entrance-fee-modal.tsx
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
import { type EntranceFeeFormData } from '@/types';
import { LoaderCircle } from 'lucide-react';
import entranceFees from '@/routes/entrance-fees';

interface CreateEntranceFeeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateEntranceFeeModal({ open, onOpenChange }: CreateEntranceFeeModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm<EntranceFeeFormData>({
        name: '',
        rental_type: 'day_tour',
        price: 0,
        min_age: null,
        max_age: null,
        description: null,
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(entranceFees.store.url(), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    const canSubmit = data.name && data.rental_type && data.price >= 0 && !processing;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Entrance Fee</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Fee Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., Adult (Day Tour)"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="rental_type">Rental Type</Label>
                        <Select value={data.rental_type} onValueChange={(value) => setData('rental_type', value)}>
                            <SelectTrigger className={errors.rental_type ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select rental type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day_tour">Day Tour</SelectItem>
                                <SelectItem value="overnight">Overnight</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.rental_type && (
                            <p className="text-sm text-red-600">{errors.rental_type}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description || ''}
                            onChange={(e) => setData('description', e.target.value || null)}
                            placeholder="Optional description"
                            rows={2}
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (₱)</Label>
                        <Input
                            id="price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => setData('price', parseFloat(e.target.value))}
                            className={errors.price ? 'border-red-500' : ''}
                        />
                        {errors.price && (
                            <p className="text-sm text-red-600">{errors.price}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="min_age">Minimum Age</Label>
                            <Input
                                id="min_age"
                                type="number"
                                min="0"
                                value={data.min_age ?? ''}
                                onChange={(e) => setData('min_age', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Optional"
                                className={errors.min_age ? 'border-red-500' : ''}
                            />
                            {errors.min_age && (
                                <p className="text-sm text-red-600">{errors.min_age}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="max_age">Maximum Age</Label>
                            <Input
                                id="max_age"
                                type="number"
                                min="0"
                                value={data.max_age ?? ''}
                                onChange={(e) => setData('max_age', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Optional"
                                className={errors.max_age ? 'border-red-500' : ''}
                            />
                            {errors.max_age && (
                                <p className="text-sm text-red-600">{errors.max_age}</p>
                            )}
                        </div>
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
                            onClick={() => {
                                reset();
                                onOpenChange(false);
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canSubmit}>
                            {processing && <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />}
                            Create Entrance Fee
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
