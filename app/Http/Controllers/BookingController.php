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
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Mail;
use App\Services\NotificationService;
use App\Mail\BookingCreated;
use App\Mail\BookingConfirmed;
use App\Mail\BookingCheckedIn;
use App\Mail\BookingCheckedOut;
use App\Mail\BookingCancelled;
use App\Mail\Admin\NewBookingNotification;

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
        $query = Booking::with(['accommodations.accommodation', 'createdBy']);

        // If user is a customer, show only their bookings
        if (auth()->user()->hasRole('customer')) {
            $query->where('created_by', auth()->id());
        }

        $bookings = $query->latest()->paginate(10);

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
                'created_by' => auth()->id(),
            ]);

            $accommodationTotal = 0;
            $entranceFeeTotal = 0;
            $totalFreeEntrances = 0;

            // Calculate number of nights for overnight bookings
            $numberOfNights = 1;
            if ($booking->booking_type === 'overnight' && $booking->check_out_date) {
                $checkIn = \Carbon\Carbon::parse($booking->check_in_date);
                $checkOut = \Carbon\Carbon::parse($booking->check_out_date);
                $numberOfNights = max(1, $checkOut->diffInDays($checkIn));
            }

            foreach ($request->accommodations as $item) {
                $accommodation = Accommodation::findOrFail($item['accommodation_id']);
                $rate = AccommodationRate::findOrFail($item['accommodation_rate_id']);

                // Calculate base subtotal (rate * nights for overnight)
                $baseRate = $rate->rate;
                if ($booking->booking_type === 'overnight') {
                    $baseRate = $rate->rate * $numberOfNights;
                }

                $subtotal = $baseRate;
                $additionalPaxCharge = 0;

                if ($accommodation->min_capacity && $item['guests'] > $accommodation->min_capacity) {
                    $additionalGuests = $item['guests'] - $accommodation->min_capacity;
                    $additionalPaxRate = $rate->additional_pax_rate ?? 0;

                    // Multiply additional pax rate by nights for overnight
                    if ($booking->booking_type === 'overnight') {
                        $additionalPaxRate = $additionalPaxRate * $numberOfNights;
                    }

                    $additionalPaxCharge = $additionalGuests * $additionalPaxRate;
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

            // Entrance fees remain the same (not multiplied by nights)
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

            $totalAmount = $accommodationTotal + $entranceFeeTotal;

            $booking->update([
                'accommodation_total' => $accommodationTotal,
                'entrance_fee_total' => $entranceFeeTotal,
                'total_amount' => $totalAmount,
            ]);

            // Load relationships for emails
            $booking->load(['accommodations.accommodation', 'createdBy']);

            DB::commit();

            // Send email notifications
            try {
                // Send to customer
                if ($booking->guest_email) {
                    Mail::to($booking->guest_email)->send(new BookingCreated($booking));
                }

                // Send to admin/staff
                $adminEmails = NotificationService::getAdminStaffEmails();
                if (!empty($adminEmails)) {
                    Mail::to($adminEmails)->send(new NewBookingNotification($booking));
                }
            } catch (\Exception $e) {
                // Log email error but don't fail the booking
                Log::error('Booking email failed: ' . $e->getMessage());
            }

            return redirect()->route('bookings.show', $booking)
                ->with('success', 'Booking created successfully. Booking code: ' . $booking->booking_code);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Booking $booking): Response
    {
        // Check if customer is trying to view someone else's booking
        if (auth()->user()->hasRole('customer') && $booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $booking->load([
            'createdBy',
            'accommodations.accommodation',
            'accommodations.accommodationRate',
            'entranceFees',
            'payments',
            'rebookings' => function ($query) {
                $query->whereIn('status', ['pending', 'approved'])
                    ->latest();
            }
        ]);

        return Inertia::render('booking/show', [
            'booking' => $booking,
        ]);
    }

    public function edit(Booking $booking): Response
    {
        // Check if customer is trying to edit someone else's booking
        if (auth()->user()->hasRole('customer') && $booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('booking/edit', [
            'booking' => $booking,
        ]);
    }

    public function update(UpdateBookingRequest $request, Booking $booking): RedirectResponse
    {
        // Check if customer is trying to update someone else's booking
        if (auth()->user()->hasRole('customer') && $booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

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

        // Send email notification
        try {
            if ($booking->guest_email) {
                Mail::to($booking->guest_email)->send(new BookingConfirmed($booking));
            }
        } catch (\Exception $e) {
            Log::error('Booking confirmation email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Booking confirmed successfully.');
    }

    public function checkIn(Booking $booking): RedirectResponse
    {
        $booking->update(['status' => 'checked_in']);

        // Send email notification
        try {
            if ($booking->guest_email) {
                Mail::to($booking->guest_email)->send(new BookingCheckedIn($booking));
            }
        } catch (\Exception $e) {
            Log::error('Check-in email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Guest checked in successfully.');
    }

    public function checkOut(Booking $booking): RedirectResponse
    {
        $booking->update(['status' => 'checked_out']);

        // Send email notification
        try {
            if ($booking->guest_email) {
                Mail::to($booking->guest_email)->send(new BookingCheckedOut($booking));
            }
        } catch (\Exception $e) {
            Log::error('Check-out email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Guest checked out successfully.');
    }

    public function cancel(Booking $booking): RedirectResponse
    {
        $booking->update(['status' => 'cancelled']);

        // Send email notification
        try {
            if ($booking->guest_email) {
                Mail::to($booking->guest_email)->send(new BookingCancelled($booking));
            }
        } catch (\Exception $e) {
            Log::error('Booking cancellation email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Booking cancelled successfully.');
    }
}
