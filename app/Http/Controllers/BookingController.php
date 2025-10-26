<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Accommodation;
use App\Models\AccommodationRate;
use App\Models\BookingAccommodation;
use App\Models\BookingEntranceFee;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Requests\Booking\UpdateBookingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:booking show|global access')->only(['index', 'show']);
        $this->middleware('permission:booking create|global access')->only(['create', 'store']);
        $this->middleware('permission:booking edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:booking delete|global access')->only('destroy');
        $this->middleware('permission:booking confirm|global access')->only('confirm');
        $this->middleware('permission:booking checkin|global access')->only('checkIn');
        $this->middleware('permission:booking checkout|global access')->only('checkOut');
        $this->middleware('permission:booking cancel|global access')->only('cancel');
    }

    public function index(): Response
    {
        $bookings = Booking::with(['accommodations.accommodation'])
            ->latest()
            ->paginate(10);

        return Inertia::render('booking/index', [
            'bookings' => $bookings,
        ]);
    }

    public function create(): Response
    {
        $accommodations = Accommodation::with('rates')->active()->orderBy('name')->get();

        return Inertia::render('booking/create', [
            'accommodations' => $accommodations,
        ]);
    }

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $booking = Booking::create([
                ...$request->except('accommodations'),
            ]);

            $accommodationTotal = 0;
            $entranceFeeTotal = 0;
            $totalFreeEntrances = 0;

            foreach ($request->accommodations as $item) {
                $accommodation = Accommodation::findOrFail($item['accommodation_id']);
                $rate = AccommodationRate::findOrFail($item['accommodation_rate_id']);

                $subtotal = $rate->rate;
                $additionalPaxCharge = 0;

                if ($accommodation->min_capacity && $item['guests'] > $accommodation->min_capacity) {
                    $additionalGuests = $item['guests'] - $accommodation->min_capacity;
                    $additionalPaxCharge = $additionalGuests * ($rate->additional_pax_rate ?? 0);
                    $subtotal += $additionalPaxCharge;
                }

                BookingAccommodation::create([
                    'booking_id' => $booking->id,
                    'accommodation_id' => $accommodation->id,
                    'accommodation_rate_id' => $rate->id,
                    'guests' => $item['guests'],
                    'rate' => $rate->rate,
                    'additional_pax_charge' => $additionalPaxCharge,
                    'subtotal' => $subtotal,
                    'free_entrance_used' => $rate->includes_free_entrance
                    ? min($item['guests'], $accommodation->min_capacity ?? 0)
                    : 0,
                ]);

                $accommodationTotal += $subtotal;

                if ($rate->includes_free_entrance) {
                    $totalFreeEntrances += min($item['guests'], $accommodation->min_capacity ?? 0);
                }
            }

            $adultsNeedingEntrance = max(0, $request->total_adults - $totalFreeEntrances);
            $childrenNeedingEntrance = $request->total_children;

            $firstSelectedRate = AccommodationRate::find($request->accommodations[0]['accommodation_rate_id']);

            if ($adultsNeedingEntrance > 0 && $firstSelectedRate?->adult_entrance_fee) {
                $adultFee = $adultsNeedingEntrance * $firstSelectedRate->adult_entrance_fee;
                BookingEntranceFee::create([
                    'booking_id' => $booking->id,
                    'type' => 'adult',
                    'quantity' => $adultsNeedingEntrance,
                    'rate' => $firstSelectedRate->adult_entrance_fee,
                    'subtotal' => $adultFee,
                ]);
                $entranceFeeTotal += $adultFee;
            }

            if ($childrenNeedingEntrance > 0 && $firstSelectedRate?->child_entrance_fee) {
                $childFee = $childrenNeedingEntrance * $firstSelectedRate->child_entrance_fee;
                BookingEntranceFee::create([
                    'booking_id' => $booking->id,
                    'type' => 'child',
                    'quantity' => $childrenNeedingEntrance,
                    'rate' => $firstSelectedRate->child_entrance_fee,
                    'subtotal' => $childFee,
                ]);
                $entranceFeeTotal += $childFee;
            }

            $booking->update([
                'accommodation_total' => $accommodationTotal,
                'entrance_fee_total' => $entranceFeeTotal,
                'total_amount' => $accommodationTotal + $entranceFeeTotal,
            ]);

            DB::commit();

            return redirect()->route('bookings.show', $booking)
                ->with('success', 'Booking created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Booking $booking): Response
    {
        $booking->load([
            'accommodations.accommodationRate',
            'entranceFees',
            'payments',
        ]);

        return Inertia::render('booking/show', [
            'booking' => $booking,
        ]);
    }

    public function edit(Booking $booking): Response
    {
        return Inertia::render('booking/edit', [
            'booking' => $booking,
        ]);
    }

    public function update(UpdateBookingRequest $request, Booking $booking): RedirectResponse
    {
        $booking->update($request->validated());

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking updated successfully.');
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        $booking->delete();

        return redirect()->route('bookings.index')
            ->with('success', 'Booking deleted successfully.');
    }

    public function confirm(Booking $booking): RedirectResponse
    {
        $booking->update(['status' => 'confirmed']);

        return back()->with('success', 'Booking confirmed successfully.');
    }

    public function checkIn(Booking $booking): RedirectResponse
    {
        $booking->update(['status' => 'checked_in']);

        return back()->with('success', 'Guest checked in successfully.');
    }

    public function checkOut(Booking $booking): RedirectResponse
    {
        $booking->update(['status' => 'checked_out']);

        return back()->with('success', 'Guest checked out successfully.');
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        $booking->update(['status' => 'cancelled']);

        return back()->with('success', 'Booking cancelled successfully.');
    }
}
