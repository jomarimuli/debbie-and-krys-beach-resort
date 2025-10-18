<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Http\Requests\CancelBookingRequest;
use App\Models\Booking;
use App\Models\BookingItem;
use App\Models\EntranceFeeDetail;
use App\Models\Room;
use App\Models\Cottage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!auth()->user()->can('global access') &&
                !auth()->user()->can('booking access') &&
                !auth()->user()->can('customer access')) {
                abort(403, 'Unauthorized');
            }
            return $next($request);
        });
    }

    public function index(Request $request)
    {
        $query = Booking::with(['user', 'createdBy', 'bookingItems.bookable'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('booking_number', 'like', "%{$search}%")
                    ->orWhere('guest_name', 'like', "%{$search}%")
                    ->orWhere('guest_email', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->booking_type, function ($query, $type) {
                $query->where('booking_type', $type);
            })
            ->when($request->payment_status, function ($query, $paymentStatus) {
                $query->where('payment_status', $paymentStatus);
            });

        if (!auth()->user()->can('global access') && !auth()->user()->can('booking access')) {
            $query->where('user_id', auth()->id());
        }

        $bookings = $query->latest()
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        return Inertia::render('bookings/index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status', 'booking_type', 'payment_status']),
        ]);
    }

    public function create()
    {
        $rooms = Room::where('is_active', true)->get();
        $cottages = Cottage::where('is_active', true)->get();

        return Inertia::render('bookings/create', [
            'rooms' => $rooms,
            'cottages' => $cottages,
        ]);
    }

    public function store(StoreBookingRequest $request)
    {
        DB::beginTransaction();

        try {
            $booking = Booking::create([
                'booking_type' => 'registered',
                'user_id' => auth()->id(),
                'check_in_date' => $request->check_in_date,
                'check_out_date' => $request->check_out_date,
                'rental_type' => $request->rental_type,
                'total_pax' => $request->total_pax,
                'notes' => $request->notes,
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            $subtotal = 0;
            foreach ($request->items as $item) {
                $bookableType = $item['item_type'] === 'room' ? Room::class : Cottage::class;
                $bookable = $bookableType::find($item['bookable_id']);

                $totalPrice = $item['unit_price'] * $item['quantity'];
                $subtotal += $totalPrice;

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
                    'total_price' => $totalPrice,
                ]);
            }

            $entranceFeeTotal = 0;
            foreach ($request->entrance_fees as $fee) {
                $freeCount = $fee['free_count'] ?? 0;
                $paidCount = $fee['pax_count'] - $freeCount;
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

            $booking->update([
                'subtotal' => $subtotal,
                'entrance_fee_total' => $entranceFeeTotal,
                'total_amount' => $subtotal + $entranceFeeTotal,
                'balance' => $subtotal + $entranceFeeTotal,
            ]);

            DB::commit();

            return redirect()->route('bookings.show', $booking)
                ->with('success', 'Booking created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create booking: ' . $e->getMessage());
        }
    }

    public function show(Booking $booking)
    {
        if (!auth()->user()->can('global access') &&
            !auth()->user()->can('booking access') &&
            $booking->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $booking->load(['user', 'createdBy', 'bookingItems.bookable', 'entranceFeeDetails']);

        return Inertia::render('bookings/show', [
            'booking' => $booking,
        ]);
    }

    public function edit(Booking $booking)
    {
        if (!auth()->user()->can('global access') &&
            !auth()->user()->can('booking access') &&
            $booking->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $booking->load(['bookingItems.bookable', 'entranceFeeDetails']);
        $rooms = Room::where('is_active', true)->get();
        $cottages = Cottage::where('is_active', true)->get();

        return Inertia::render('bookings/edit', [
            'booking' => $booking,
            'rooms' => $rooms,
            'cottages' => $cottages,
        ]);
    }

    public function update(UpdateBookingRequest $request, Booking $booking)
    {
        $booking->update($request->validated());

        if ($request->has('paid_amount')) {
            $booking->paid_amount = $request->paid_amount;
            $booking->calculateBalance();
            $booking->updatePaymentStatus();
        }

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking updated successfully!');
    }

    public function cancel(CancelBookingRequest $request, Booking $booking)
    {
        if ($booking->status === 'cancelled') {
            return back()->with('error', 'Booking is already cancelled.');
        }

        $booking->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->cancellation_reason,
            'cancelled_at' => now(),
        ]);

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking cancelled successfully!');
    }

    public function destroy(Booking $booking)
    {
        if (!auth()->user()->can('global access')) {
            abort(403, 'Unauthorized');
        }

        $booking->delete();

        return redirect()->route('bookings.index')
            ->with('success', 'Booking deleted successfully!');
    }
}
