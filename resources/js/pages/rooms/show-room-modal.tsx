// resources/js/pages/rooms/show-room-modal.tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hotel, Users, DollarSign, Hash, Calendar, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { RoomData } from '@/types';
import { useState } from 'react';

interface ShowRoomModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    room: RoomData;
}

export default function ShowRoomModal({
    open,
    onOpenChange,
    room
}: ShowRoomModalProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Hotel className="w-5 h-5" />
                            Room Details
                        </DialogTitle>
                    </DialogHeader>

                    <div className="overflow-y-auto flex-1 space-y-6 pr-2">
                        {room.images && room.images.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Room Images
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {room.images.map((image, index) => (
                                        <div
                                            key={index}
                                            className="relative group cursor-pointer"
                                            onClick={() => setSelectedImage(`/storage/${image}`)}
                                        >
                                            <img
                                                src={`/storage/${image}`}
                                                alt={`${room.name} ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border hover:opacity-75 transition-opacity"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Room Name</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Hotel className="w-4 h-4 text-gray-500" />
                                    <span>{room.name}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Room Size</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Badge variant={room.size === 'big' ? 'default' : 'secondary'}>
                                        {room.size_label}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {room.description && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700">{room.description}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Maximum Pax</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span>{room.max_pax} persons</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Day Tour Price</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">₱{room.formatted_day_tour_price}</span>
                                </div>
                            </div>
                        </div>

                        {room.overnight_price && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Overnight Price</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                        <DollarSign className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">₱{room.formatted_overnight_price}</span>
                                    </div>
                                </div>

                                {room.free_cottage_size && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Free Cottage</label>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                            <Badge variant="outline">
                                                {room.free_cottage_size} cottage
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Free Entrance Count</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <span>{room.free_entrance_count} persons</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Excess Pax Fee</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                    <span>₱{room.formatted_excess_pax_fee}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Available Quantity</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Hash className="w-4 h-4 text-gray-500" />
                                    <span>{room.quantity} rooms</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Air Conditioned</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    {room.has_ac ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-green-600">Yes</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-500">No</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Status</label>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                <Badge variant={room.is_active ? 'default' : 'secondary'}>
                                    {room.status_label}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Created At</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>{room.created_at}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span>{room.updated_at}</span>
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

            {selectedImage && (
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-4xl">
                        <img
                            src={selectedImage}
                            alt="Room preview"
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
