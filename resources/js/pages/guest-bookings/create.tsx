// resources/js/pages/guest-bookings/create.tsx

import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, Users, Plus, Minus, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ImageViewer from '@/components/image-viewer';
import type { Room, Cottage, BookingItemFormData, EntranceFeeFormData } from '@/types';

interface GuestBookingCreateProps {
    rooms: Room[];
    cottages: Cottage[];
}

export default function GuestBookingCreate({ rooms, cottages }: GuestBookingCreateProps) {
    const [selectedItems, setSelectedItems] = useState<BookingItemFormData[]>([]);
    const [entranceFees, setEntranceFees] = useState<EntranceFeeFormData[]>([
        {
            entrance_fee_id: undefined,
            fee_name: 'Adult (Day Tour)',
            rental_type: 'day_tour',
            age_min: 6,
            age_max: undefined,
            pax_count: 0,
            rate: 100,
            free_count: 0
        },
        {
            entrance_fee_id: undefined,
            fee_name: 'Child (Day Tour)',
            rental_type: 'day_tour',
            age_min: 0,
            age_max: 5,
            pax_count: 0,
            rate: 50,
            free_count: 0
        },
    ]);

    // Image viewer state
    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [currentImages, setCurrentImages] = useState<string[]>([]);
    const [initialImageIndex, setInitialImageIndex] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        guest_address: '',
        check_in_date: '',
        check_out_date: '',
        rental_type: 'day_tour' as 'overnight' | 'day_tour',
        total_pax: 0,
        notes: '',
        items: [] as BookingItemFormData[],
        entrance_fees: [] as EntranceFeeFormData[],
    });

    const openImageViewer = (images: string[], startIndex: number = 0) => {
        setCurrentImages(images);
        setInitialImageIndex(startIndex);
        setImageViewerOpen(true);
    };

    const addItem = (type: 'room' | 'cottage', item: Room | Cottage) => {
        const bookableType = type === 'room' ? 'App\\Models\\Room' : 'App\\Models\\Cottage';
        const price = data.rental_type === 'overnight'
            ? (type === 'room' ? item.overnight_price : item.overnight_price)
            : (type === 'room' ? item.day_tour_price : item.day_tour_price);

        const newItem: BookingItemFormData = {
            bookable_type: bookableType,
            bookable_id: item.id,
            item_name: item.name,
            item_type: type,
            rental_type: data.rental_type,
            quantity: 1,
            pax: 0,
            unit_price: parseFloat(price?.toString() || '0'),
        };

        setSelectedItems([...selectedItems, newItem]);
        toast.success(`${item.name} added to booking`);
    };

    const removeItem = (index: number) => {
        const item = selectedItems[index];
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
        toast.info(`${item.item_name} removed`);
    };

    const updateItem = (index: number, field: keyof BookingItemFormData, value: any) => {
        const updated = [...selectedItems];
        updated[index] = { ...updated[index], [field]: value };
        setSelectedItems(updated);
    };

    const updateEntranceFee = (index: number, field: keyof EntranceFeeFormData, value: any) => {
        const updated = [...entranceFees];
        updated[index] = { ...updated[index], [field]: value };
        setEntranceFees(updated);
    };

    const handleRentalTypeChange = (newRentalType: 'overnight' | 'day_tour') => {
        setData('rental_type', newRentalType);

        if (newRentalType === 'overnight') {
            setEntranceFees([
                {
                    entrance_fee_id: undefined,
                    fee_name: 'Per Head (Overnight)',
                    rental_type: 'overnight',
                    age_min: undefined,
                    age_max: undefined,
                    pax_count: 0,
                    rate: 150,
                    free_count: 0
                },
            ]);
        } else {
            setEntranceFees([
                {
                    entrance_fee_id: undefined,
                    fee_name: 'Adult (Day Tour)',
                    rental_type: 'day_tour',
                    age_min: 6,
                    age_max: undefined,
                    pax_count: 0,
                    rate: 100,
                    free_count: 0
                },
                {
                    entrance_fee_id: undefined,
                    fee_name: 'Child (Day Tour)',
                    rental_type: 'day_tour',
                    age_min: 0,
                    age_max: 5,
                    pax_count: 0,
                    rate: 50,
                    free_count: 0
                },
            ]);
        }

        setSelectedItems([]);
    };

    const calculateTotalPax = () => {
        return selectedItems.reduce((sum, item) => sum + item.pax, 0);
    };

    const calculateSubtotal = () => {
        return selectedItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    };

    const calculateExcessPaxFees = () => {
        return selectedItems.reduce((sum, item) => {
            if (item.item_type !== 'room') return sum;

            const room = rooms.find(r => r.id === item.bookable_id);
            if (!room) return sum;

            const extraPax = Math.max(0, item.pax - room.free_entrance_count);
            return sum + (extraPax * room.excess_pax_fee);
        }, 0);
    };

    const calculateEntranceFeeTotal = () => {
        return entranceFees.reduce((sum, fee) => {
            const paid = Math.max(0, fee.pax_count - (fee.free_count || 0));
            return sum + (paid * fee.rate);
        }, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateExcessPaxFees() + calculateEntranceFeeTotal();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedItems.length === 0) {
            toast.error('Please select at least one room or cottage');
            return;
        }

        const totalPax = calculateTotalPax();

        if (totalPax === 0) {
            toast.error('Please specify number of guests for your booking');
            return;
        }

        post('/guest-bookings', {
            data: {
                ...data,
                total_pax: totalPax,
                items: selectedItems,
                entrance_fees: entranceFees.filter(fee => fee.pax_count > 0),
            },
            onSuccess: () => {
                toast.success('Booking submitted successfully!');
            },
            onError: (errors) => {
                toast.error('Failed to submit booking');
                console.error(errors);
            },
        });
    };

    const getRoomPrice = (room: Room) => {
        return data.rental_type === 'overnight'
            ? (room.overnight_price ? parseFloat(room.overnight_price.toString()) : parseFloat(room.day_tour_price.toString()))
            : parseFloat(room.day_tour_price.toString());
    };

    const getCottagePrice = (cottage: Cottage) => {
        return data.rental_type === 'overnight'
            ? parseFloat(cottage.overnight_price.toString())
            : parseFloat(cottage.day_tour_price.toString());
    };

    const getExcessPaxFee = (roomId: number, pax: number) => {
        const room = rooms.find(r => r.id === roomId);
        if (!room) return 0;

        const extraPax = Math.max(0, pax - room.free_entrance_count);
        return extraPax * room.excess_pax_fee;
    };

    return (
        <>
            <Head title="Book Your Stay" />

            <div className="min-h-screen bg-[#F5F2E8] py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-[#2C3E50] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                            Book Your Stay
                        </h1>
                        <p className="text-[#64748B]">Fill out the form below to reserve your spot at our beach resort</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Tabs defaultValue="information" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="information">Your Info</TabsTrigger>
                                <TabsTrigger value="details">Booking</TabsTrigger>
                                <TabsTrigger value="rooms">Rooms</TabsTrigger>
                                <TabsTrigger value="cottages">Cottages</TabsTrigger>
                                <TabsTrigger value="summary">Summary</TabsTrigger>
                            </TabsList>

                            {/* Tab 1: Your Information */}
                            <TabsContent value="information" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Your Information</CardTitle>
                                        <CardDescription>Please provide your contact details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="guest_name">Full Name *</Label>
                                            <Input
                                                id="guest_name"
                                                value={data.guest_name}
                                                onChange={(e) => setData('guest_name', e.target.value)}
                                                placeholder="Juan Dela Cruz"
                                                required
                                            />
                                            {errors.guest_name && (
                                                <p className="text-sm text-red-500">{errors.guest_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest_email">Email Address *</Label>
                                            <Input
                                                id="guest_email"
                                                type="email"
                                                value={data.guest_email}
                                                onChange={(e) => setData('guest_email', e.target.value)}
                                                placeholder="juan@example.com"
                                                required
                                            />
                                            {errors.guest_email && (
                                                <p className="text-sm text-red-500">{errors.guest_email}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest_phone">Phone Number *</Label>
                                            <Input
                                                id="guest_phone"
                                                type="tel"
                                                value={data.guest_phone}
                                                onChange={(e) => setData('guest_phone', e.target.value)}
                                                placeholder="0927 821 0836"
                                                required
                                            />
                                            {errors.guest_phone && (
                                                <p className="text-sm text-red-500">{errors.guest_phone}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest_address">Address</Label>
                                            <Input
                                                id="guest_address"
                                                value={data.guest_address || ''}
                                                onChange={(e) => setData('guest_address', e.target.value)}
                                                placeholder="City, Province"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Additional Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes || ''}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Special requests, dietary requirements, etc."
                                                rows={4}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab 2: Booking Details */}
                            <TabsContent value="details" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Booking Details</CardTitle>
                                        <CardDescription>Select your dates and booking type</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Booking Type *</Label>
                                            <RadioGroup
                                                value={data.rental_type}
                                                onValueChange={(value) => handleRentalTypeChange(value as 'overnight' | 'day_tour')}
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="day_tour" id="day_tour" />
                                                    <Label htmlFor="day_tour" className="font-normal cursor-pointer">
                                                        Day Tour
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="overnight" id="overnight" />
                                                    <Label htmlFor="overnight" className="font-normal cursor-pointer">
                                                        Overnight Stay
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="check_in_date">
                                                <Calendar className="inline w-4 h-4 mr-1" />
                                                Check-in Date *
                                            </Label>
                                            <Input
                                                id="check_in_date"
                                                type="date"
                                                value={data.check_in_date}
                                                onChange={(e) => setData('check_in_date', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                            {errors.check_in_date && (
                                                <p className="text-sm text-red-500">{errors.check_in_date}</p>
                                            )}
                                        </div>

                                        {data.rental_type === 'overnight' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="check_out_date">
                                                    <Calendar className="inline w-4 h-4 mr-1" />
                                                    Check-out Date *
                                                </Label>
                                                <Input
                                                    id="check_out_date"
                                                    type="date"
                                                    value={data.check_out_date || ''}
                                                    onChange={(e) => setData('check_out_date', e.target.value)}
                                                    min={data.check_in_date || new Date().toISOString().split('T')[0]}
                                                    required={data.rental_type === 'overnight'}
                                                />
                                                {errors.check_out_date && (
                                                    <p className="text-sm text-red-500">{errors.check_out_date}</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="pt-4 border-t">
                                            <h3 className="font-semibold mb-4">Entrance Fees</h3>
                                            <div className="space-y-3">
                                                {entranceFees.map((fee, index) => (
                                                    <div key={index}>
                                                        <Label>{fee.fee_name} (₱{fee.rate})</Label>
                                                        <Input
                                                            type="number"
                                                            value={fee.pax_count}
                                                            onChange={(e) => updateEntranceFee(index, 'pax_count', parseInt(e.target.value) || 0)}
                                                            min={0}
                                                            placeholder="Number of guests"
                                                            className="mt-1"
                                                        />
                                                        <p className="text-xs text-[#64748B] mt-1">
                                                            Total: ₱{(Math.max(0, fee.pax_count - (fee.free_count || 0)) * fee.rate).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab 3: Select Rooms */}
                            <TabsContent value="rooms" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Select Rooms</CardTitle>
                                        <CardDescription>Choose your preferred accommodations</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                            {rooms.map((room) => (
                                                <div
                                                    key={room.id}
                                                    className="border border-[#D4B896] rounded-lg p-3 hover:border-[#C3A277] transition-colors"
                                                >
                                                    <div className="flex gap-3">
                                                        {room.images && room.images.length > 0 && (
                                                            <div className="relative flex-shrink-0">
                                                                <img
                                                                    src={`/storage/${room.images[0]}`}
                                                                    alt={room.name}
                                                                    className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                                                                    onClick={() => openImageViewer(room.images!, 0)}
                                                                />
                                                                {room.images.length > 1 && (
                                                                    <div className="absolute top-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                                                                        <ImageIcon className="w-3 h-3" />
                                                                        {room.images.length}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h3 className="font-semibold text-[#2C3E50] text-sm">{room.name}</h3>
                                                                <p className="font-bold text-[#E55A2B] text-sm">₱{getRoomPrice(room).toLocaleString()}</p>
                                                            </div>
                                                            <p className="text-xs text-[#64748B]">
                                                                Max: {room.max_pax} pax{room.has_ac && ' • AC'}
                                                            </p>
                                                            <p className="text-xs text-[#64748B]">
                                                                Free: {room.free_entrance_count} entrance
                                                                {room.free_cottage_size && ` + ${room.free_cottage_size} cottage`}
                                                            </p>
                                                            <p className="text-xs text-[#E55A2B] font-medium">
                                                                Excess: ₱{room.excess_pax_fee}/pax
                                                            </p>
                                                            {room.description && (
                                                                <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{room.description}</p>
                                                            )}
                                                            <Button
                                                                type="button"
                                                                onClick={() => addItem('room', room)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full mt-2 h-8 text-xs"
                                                                disabled={room.quantity === 0}
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" />
                                                                {room.quantity > 0 ? 'Add' : 'N/A'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab 4: Select Cottages */}
                            <TabsContent value="cottages" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Select Cottages</CardTitle>
                                        <CardDescription>Add cottages to your booking</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                            {cottages.map((cottage) => (
                                                <div
                                                    key={cottage.id}
                                                    className="border border-[#D4B896] rounded-lg p-3 hover:border-[#C3A277] transition-colors"
                                                >
                                                    <div className="flex gap-3">
                                                        {cottage.images && cottage.images.length > 0 && (
                                                            <div className="relative flex-shrink-0">
                                                                <img
                                                                    src={`/storage/${cottage.images[0]}`}
                                                                    alt={cottage.name}
                                                                    className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                                                                    onClick={() => openImageViewer(cottage.images!, 0)}
                                                                />
                                                                {cottage.images.length > 1 && (
                                                                    <div className="absolute top-1 right-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                                                                        <ImageIcon className="w-3 h-3" />
                                                                        {cottage.images.length}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h3 className="font-semibold text-[#2C3E50] text-sm">{cottage.name}</h3>
                                                                <p className="font-bold text-[#E55A2B] text-sm">₱{getCottagePrice(cottage).toLocaleString()}</p>
                                                            </div>
                                                            <p className="text-xs text-[#64748B]">Max: {cottage.max_pax} pax</p>
                                                            {cottage.description && (
                                                                <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{cottage.description}</p>
                                                            )}
                                                            <Button
                                                                type="button"
                                                                onClick={() => addItem('cottage', cottage)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full mt-2 h-8 text-xs"
                                                                disabled={cottage.quantity === 0}
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" />
                                                                {cottage.quantity > 0 ? 'Add' : 'N/A'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tab 5: Summary */}
                            <TabsContent value="summary" className="space-y-4">
                                {selectedItems.length > 0 ? (
                                    <>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Your Selection</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {selectedItems.map((item, index) => (
                                                    <div key={index} className="border border-[#D4B896] rounded-lg p-3">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-semibold text-sm">{item.item_name}</h4>
                                                                <p className="text-xs text-[#64748B] capitalize">{item.item_type}</p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                onClick={() => removeItem(index)}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Quantity</Label>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0"
                                                                    >
                                                                        <Minus className="w-3 h-3" />
                                                                    </Button>
                                                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-7 w-7 p-0"
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <Label className="text-xs">Guests *</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={item.pax}
                                                                    onChange={(e) => updateItem(index, 'pax', parseInt(e.target.value) || 0)}
                                                                    min={0}
                                                                    required
                                                                    className="h-7 text-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mt-2 pt-2 border-t border-[#D4B896] space-y-0.5">
                                                            <div className="flex justify-between text-xs">
                                                                <span>Base ({item.quantity}x)</span>
                                                                <span className="font-semibold">
                                                                    ₱{(item.unit_price * item.quantity).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {item.item_type === 'room' && item.pax > 0 && (() => {
                                                                const excessFee = getExcessPaxFee(item.bookable_id, item.pax);
                                                                const room = rooms.find(r => r.id === item.bookable_id);
                                                                const extraPax = room ? Math.max(0, item.pax - room.free_entrance_count) : 0;

                                                                return excessFee > 0 && (
                                                                    <div className="flex justify-between text-xs text-[#E55A2B]">
                                                                        <span>Excess ({extraPax})</span>
                                                                        <span className="font-semibold">₱{excessFee.toLocaleString()}</span>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-[#EBE6D8]">
                                            <CardHeader>
                                                <CardTitle>Booking Summary</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Total Guests</span>
                                                    <span className="font-semibold">
                                                        <Users className="inline w-4 h-4 mr-1" />
                                                        {calculateTotalPax()} pax
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Rooms & Cottages</span>
                                                    <span className="font-semibold">₱{calculateSubtotal().toLocaleString()}</span>
                                                </div>
                                                {calculateExcessPaxFees() > 0 && (
                                                    <div className="flex justify-between text-sm text-[#E55A2B]">
                                                        <span>Excess Pax Fees</span>
                                                        <span className="font-semibold">₱{calculateExcessPaxFees().toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm">
                                                    <span>Entrance Fees</span>
                                                    <span className="font-semibold">₱{calculateEntranceFeeTotal().toLocaleString()}</span>
                                                </div>
                                                <div className="pt-2 border-t border-[#D4B896]">
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span>Total Amount</span>
                                                        <span className="text-[#E55A2B]">₱{calculateTotal().toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                ) : (
                                    <Card>
                                        <CardContent className="py-12 text-center">
                                            <p className="text-[#64748B]">No items selected yet. Please go to Rooms or Cottages tab to add items to your booking.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || selectedItems.length === 0}
                                className="bg-[#E55A2B] hover:bg-[#D14D24] text-white"
                            >
                                {processing ? 'Submitting...' : 'Submit Booking'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Image Viewer */}
            <ImageViewer
                images={currentImages}
                initialIndex={initialImageIndex}
                open={imageViewerOpen}
                onOpenChange={setImageViewerOpen}
            />
        </>
    );
}
