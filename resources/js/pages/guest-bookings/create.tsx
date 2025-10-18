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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    };

    const removeItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
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

    const calculateEntranceFeeTotal = () => {
        return entranceFees.reduce((sum, fee) => {
            const paid = fee.pax_count - (fee.free_count || 0);
            return sum + (paid * fee.rate);
        }, 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateEntranceFeeTotal();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedItems.length === 0) {
            toast.error('Please select at least one room or cottage');
            return;
        }

        const totalPax = calculateTotalPax();

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
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Information</CardTitle>
                                <CardDescription>Please provide your contact details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </div>
                            </CardContent>
                        </Card>

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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                Check-out Date
                                            </Label>
                                            <Input
                                                id="check_out_date"
                                                type="date"
                                                value={data.check_out_date || ''}
                                                onChange={(e) => setData('check_out_date', e.target.value)}
                                                min={data.check_in_date || new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Select Rooms</CardTitle>
                                <CardDescription>Choose your preferred accommodations</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {rooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className="border border-[#D4B896] rounded-lg p-4 hover:border-[#C3A277] transition-colors"
                                        >
                                            {room.images && room.images.length > 0 && (
                                                <div className="relative mb-3 group">
                                                    <img
                                                        src={`/storage/${room.images[0]}`}
                                                        alt={room.name}
                                                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                                        onClick={() => setSelectedImage(`/storage/${room.images[0]}`)}
                                                    />
                                                    {room.images.length > 1 && (
                                                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                                            <ImageIcon className="w-3 h-3" />
                                                            {room.images.length}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-[#2C3E50]">{room.name}</h3>
                                                    <p className="text-sm text-[#64748B]">
                                                        Max: {room.max_pax} pax
                                                        {room.has_ac && ' • With AC'}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-[#E55A2B]">₱{getRoomPrice(room).toLocaleString()}</p>
                                            </div>
                                            {room.description && (
                                                <p className="text-sm text-[#64748B] mb-3">{room.description}</p>
                                            )}
                                            <Button
                                                type="button"
                                                onClick={() => addItem('room', room)}
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add Room
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Select Cottages</CardTitle>
                                <CardDescription>Add cottages to your booking</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cottages.map((cottage) => (
                                        <div
                                            key={cottage.id}
                                            className="border border-[#D4B896] rounded-lg p-4 hover:border-[#C3A277] transition-colors"
                                        >
                                            {cottage.images && cottage.images.length > 0 && (
                                                <div className="relative mb-3 group">
                                                    <img
                                                        src={`/storage/${cottage.images[0]}`}
                                                        alt={cottage.name}
                                                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                                                        onClick={() => setSelectedImage(`/storage/${cottage.images[0]}`)}
                                                    />
                                                    {cottage.images.length > 1 && (
                                                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                                            <ImageIcon className="w-3 h-3" />
                                                            {cottage.images.length}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-[#2C3E50]">{cottage.name}</h3>
                                                    <p className="text-sm text-[#64748B]">Max: {cottage.max_pax} pax</p>
                                                </div>
                                                <p className="font-bold text-[#E55A2B]">₱{getCottagePrice(cottage).toLocaleString()}</p>
                                            </div>
                                            {cottage.description && (
                                                <p className="text-sm text-[#64748B] mb-3">{cottage.description}</p>
                                            )}
                                            <Button
                                                type="button"
                                                onClick={() => addItem('cottage', cottage)}
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Add Cottage
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {selectedItems.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Selection</CardTitle>
                                    <CardDescription>Review and adjust your booking</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {selectedItems.map((item, index) => (
                                        <div key={index} className="border border-[#D4B896] rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-[#2C3E50]">{item.item_name}</h4>
                                                    <p className="text-sm text-[#64748B] capitalize">{item.item_type}</p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Quantity</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            onClick={() => updateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </Button>
                                                        <span className="w-12 text-center">{item.quantity}</span>
                                                        <Button
                                                            type="button"
                                                            onClick={() => updateItem(index, 'quantity', item.quantity + 1)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Number of Guests</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.pax}
                                                        onChange={(e) => updateItem(index, 'pax', parseInt(e.target.value) || 0)}
                                                        min={0}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-[#D4B896]">
                                                <div className="flex justify-between text-sm">
                                                    <span>Price</span>
                                                    <span className="font-semibold">
                                                        ₱{(item.unit_price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {selectedItems.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Entrance Fees</CardTitle>
                                    <CardDescription>Specify number of guests by category</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {entranceFees.map((fee, index) => (
                                        <div key={index} className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>{fee.fee_name} (₱{fee.rate})</Label>
                                                <Input
                                                    type="number"
                                                    value={fee.pax_count}
                                                    onChange={(e) => updateEntranceFee(index, 'pax_count', parseInt(e.target.value) || 0)}
                                                    min={0}
                                                    placeholder="Number of guests"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <p className="text-sm text-[#64748B]">
                                                    Total: ₱{((fee.pax_count - (fee.free_count || 0)) * fee.rate).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Notes</CardTitle>
                                <CardDescription>Any special requests or requirements?</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={data.notes || ''}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Special requests, dietary requirements, etc."
                                    rows={4}
                                />
                            </CardContent>
                        </Card>

                        {selectedItems.length > 0 && (
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
                        )}

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

            {selectedImage && (
                <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                    <DialogContent className="max-w-4xl">
                        <img
                            src={selectedImage}
                            alt="Preview"
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
