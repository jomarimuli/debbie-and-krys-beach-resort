// resources/js/pages/entrance-fees/delete-entrance-fee-modal.tsx
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { EntranceFeeData } from '@/types';
import entranceFees from '@/routes/entrance-fees';

interface DeleteEntranceFeeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entranceFee: EntranceFeeData;
}

export default function DeleteEntranceFeeModal({
    open,
    onOpenChange,
    entranceFee
}: DeleteEntranceFeeModalProps) {
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(entranceFees.destroy.url(entranceFee.id), {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Delete Entrance Fee</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the entrance fee "{entranceFee?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Name:</strong> {entranceFee?.name}</p>
                    <p><strong>Rental Type:</strong> {entranceFee?.rental_type_label}</p>
                    <p><strong>Price:</strong> ₱{entranceFee?.formatted_price}</p>
                    <p><strong>Age Range:</strong> {entranceFee?.age_range}</p>
                    <p><strong>Status:</strong> {entranceFee?.status_label}</p>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={processing}
                    >
                        {processing ? 'Deleting...' : 'Delete Entrance Fee'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
