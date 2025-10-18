// resources/js/pages/entrance-fees/show-entrance-fee-modal.tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Tag, Users, Calendar, FileText } from 'lucide-react';
import { EntranceFeeData } from '@/types';

interface ShowEntranceFeeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entranceFee: EntranceFeeData;
}

export default function ShowEntranceFeeModal({
    open,
    onOpenChange,
    entranceFee
}: ShowEntranceFeeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Entrance Fee Details
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 space-y-6 pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Fee Name</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Tag className="w-4 h-4 text-gray-500" />
                                <span>{entranceFee.name}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Rental Type</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Badge variant="outline">
                                    {entranceFee.rental_type_label}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {entranceFee.description && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <p className="text-sm text-gray-700">{entranceFee.description}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Price</label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-lg">₱{entranceFee.formatted_price}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Age Range</label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span>{entranceFee.age_range}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Minimum Age</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <span>{entranceFee.min_age !== null ? `${entranceFee.min_age} years` : 'Not specified'}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Maximum Age</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <span>{entranceFee.max_age !== null ? `${entranceFee.max_age} years` : 'Not specified'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Badge variant={entranceFee.is_active ? 'default' : 'secondary'}>
                                {entranceFee.status_label}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Created At</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>{entranceFee.created_at}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Last Updated</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span>{entranceFee.updated_at}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
