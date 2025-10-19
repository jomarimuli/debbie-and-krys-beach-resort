<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGuestBookingRequest;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\EntranceFeeDetail;
use App\Models\Room;
use App\Models\Cottage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GuestBookingController extends Controller
{
    public function create()
    {
        $rooms = Room::where('is_active', true)->get();
        $cottages = Cottage::where('is_active', true)->get();

        return Inertia::render('guest-bookings/create', [
            'rooms' => $rooms,
            'cottages' => $cottages,
        ]);
    }

    public function store(StoreGuestBookingRequest $request)
    {
        DB::beginTransaction();

        try {
            $booking = Booking::create([
                'booking_number' => 'BK-' . strtoupper(uniqid()),
                'booking_type' => 'guest',
                'user_id' => null,
                'guest_name' => $request->guest_name,
                'guest_email' => $request->guest_email,
                'guest_phone' => $request->guest_phone,
                'guest_address' => $request->guest_address,
                'check_in_date' => $request->check_in_date,
                'check_out_date' => $request->check_out_date,
                'rental_type' => $request->rental_type,
                'total_pax' => $request->total_pax,
                'notes' => $request->notes,
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            $subtotal = 0;
            $totalExcessFees = 0;

            foreach ($request->items as $item) {
                $bookableType = $item['item_type'] === 'room' ? Room::class : Cottage::class;
                $bookable = $bookableType::findOrFail($item['bookable_id']);

                $itemTotal = $item['unit_price'] * $item['quantity'];

                // Calculate excess pax fee (ROOMS ONLY)
                $extraPax = 0;
                $excessFee = 0;
                $freeEntranceCount = 0;
                $freeCottageSize = null;

                if ($item['item_type'] === 'room') {
                    $freeEntranceCount = $bookable->free_entrance_count;
                    $freeCottageSize = $bookable->free_cottage_size;

                    if ($item['pax'] > $freeEntranceCount) {
                        $extraPax = $item['pax'] - $freeEntranceCount;
                        $excessFee = $extraPax * $bookable->excess_pax_fee;
                        $totalExcessFees += $excessFee;
                    }
                }

                BookingItem::create([
                    'booking_id' => $booking->id,
                    'bookable_type' => $bookableType,
                    'bookable_id' => $item['bookable_id'],
                    'item_name' => $item['item_name'],
                    'item_type' => $item['item_type'],
                    'rental_type' => $item['rental_type'],
                    'quantity' => $item['quantity'],
                    'pax' => $item['pax'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $itemTotal,
                    'free_entrance_count' => $freeEntranceCount,
                    'free_cottage_size' => $freeCottageSize,
                    'extra_pax' => $extraPax,
                    'excess_pax_fee' => $excessFee,
                ]);

                $subtotal += $itemTotal;
            }

            $entranceFeeTotal = 0;
            foreach ($request->entrance_fees as $fee) {
                $freeCount = $fee['free_count'] ?? 0;
                $paidCount = max(0, $fee['pax_count'] - $freeCount);
                $total = $paidCount * $fee['rate'];
                $entranceFeeTotal += $total;

                EntranceFeeDetail::create([
                    'booking_id' => $booking->id,
                    'entrance_fee_id' => $fee['entrance_fee_id'] ?? null,
                    'fee_name' => $fee['fee_name'],
                    'rental_type' => $fee['rental_type'],
                    'age_min' => $fee['age_min'] ?? null,
                    'age_max' => $fee['age_max'] ?? null,
                    'pax_count' => $fee['pax_count'],
                    'rate' => $fee['rate'],
                    'total' => $total,
                    'free_count' => $freeCount,
                    'paid_count' => $paidCount,
                ]);
            }

            $grandTotal = $subtotal + $totalExcessFees + $entranceFeeTotal;

            $booking->update([
                'subtotal' => $subtotal,
                'entrance_fee_total' => $entranceFeeTotal,
                'total_amount' => $grandTotal,
                'balance' => $grandTotal,
            ]);

            DB::commit();

            return redirect()->route('guest-bookings.show', $booking->booking_number)
                ->with('success', 'Booking submitted successfully! We will contact you shortly.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to create booking: ' . $e->getMessage());
        }
    }

    public function show(string $bookingNumber)
    {
        $booking = Booking::where('booking_number', $bookingNumber)
            ->where('booking_type', 'guest')
            ->with(['bookingItems.bookable', 'entranceFeeDetails'])
            ->firstOrFail();

        return Inertia::render('guest-bookings/show', [
            'booking' => $booking,
        ]);
    }
}
