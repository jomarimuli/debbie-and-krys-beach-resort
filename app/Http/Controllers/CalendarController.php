<?php

namespace App\Http\Controllers;

use App\Models\Accommodation;
use App\Models\Booking;
use App\Models\Rebooking;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today();

        return Inertia::render('calendar/index', [
            'selectedDate' => $today->format('Y-m-d'),
            'accommodations' => $this->getAccommodationsForDate($today),
            'monthOverview' => $this->getMonthOverview($today),
        ]);
    }

    public function show(string $date): Response
    {
        $selectedDate = Carbon::parse($date);

        return Inertia::render('calendar/index', [
            'selectedDate' => $selectedDate->format('Y-m-d'),
            'accommodations' => $this->getAccommodationsForDate($selectedDate),
            'monthOverview' => $this->getMonthOverview($selectedDate),
        ]);
    }

    private function getAccommodationsForDate(Carbon $date): array
    {
        $accommodations = Accommodation::with('rates')
            ->active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return $accommodations->map(function ($accommodation) use ($date) {
            $isAvailable = $accommodation->isAvailableForDates($date, $date);

            $booking = null;
            if (!$isAvailable) {
                $booking = $this->getBookingForDate($accommodation->id, $date);
            }

            return [
                'id' => $accommodation->id,
                'name' => $accommodation->name,
                'type' => $accommodation->type,
                'size' => $accommodation->size,
                'is_air_conditioned' => $accommodation->is_air_conditioned,
                'min_capacity' => $accommodation->min_capacity,
                'max_capacity' => $accommodation->max_capacity,
                'first_image_url' => $accommodation->first_image_url,
                'day_tour_rate' => $accommodation->rates->where('booking_type', 'day_tour')->where('is_active', true)->first()?->rate,
                'overnight_rate' => $accommodation->rates->where('booking_type', 'overnight')->where('is_active', true)->first()?->rate,
                'is_available' => $isAvailable,
                'booking' => $booking,
            ];
        })->toArray();
    }

    private function getBookingForDate(int $accommodationId, Carbon $date): ?array
    {
        $bookingAccom = \App\Models\BookingAccommodation::where('accommodation_id', $accommodationId)
            ->whereHas('booking', function ($query) use ($date) {
                $query->whereIn('status', ['pending', 'confirmed', 'checked_in'])
                    ->where(function ($q) use ($date) {
                        $q->where('check_in_date', '<=', $date)
                            ->where(function ($sub) use ($date) {
                                $sub->whereNull('check_out_date')
                                    ->orWhere('check_out_date', '>=', $date);
                            });
                    });
            })
            ->with(['booking' => function ($query) {
                $query->with('rebookings');
            }])
            ->first();

        if (!$bookingAccom) {
            return null;
        }

        $booking = $bookingAccom->booking;

        $approvedRebooking = $booking->rebookings()
            ->where('status', 'approved')
            ->latest()
            ->first();

        if ($approvedRebooking) {
            $checkIn = Carbon::parse($approvedRebooking->new_check_in_date);
            $checkOut = $approvedRebooking->new_check_out_date
                ? Carbon::parse($approvedRebooking->new_check_out_date)
                : $checkIn;

            if ($date->between($checkIn, $checkOut)) {
                return [
                    'booking_number' => $booking->booking_number,
                    'guest_name' => $booking->guest_name,
                    'check_in_date' => $approvedRebooking->new_check_in_date,
                    'check_out_date' => $approvedRebooking->new_check_out_date,
                    'status' => $booking->status,
                    'booking_type' => $booking->booking_type,
                ];
            }
        } else {
            return [
                'booking_number' => $booking->booking_number,
                'guest_name' => $booking->guest_name,
                'check_in_date' => $booking->check_in_date->format('Y-m-d'),
                'check_out_date' => $booking->check_out_date?->format('Y-m-d'),
                'status' => $booking->status,
                'booking_type' => $booking->booking_type,
            ];
        }

        return null;
    }

    private function getMonthOverview(Carbon $date): array
    {
        $startOfMonth = $date->copy()->startOfMonth();
        $endOfMonth = $date->copy()->endOfMonth();
        $overview = [];

        $totalAccommodations = Accommodation::active()->count();

        for ($day = $startOfMonth->copy(); $day->lte($endOfMonth); $day->addDay()) {
            $availableCount = 0;

            $accommodations = Accommodation::active()->get();
            foreach ($accommodations as $accommodation) {
                if ($accommodation->isAvailableForDates($day, $day)) {
                    $availableCount++;
                }
            }

            $overview[$day->format('Y-m-d')] = [
                'total' => $totalAccommodations,
                'available' => $availableCount,
                'booked' => $totalAccommodations - $availableCount,
                'status' => $availableCount === 0 ? 'full' : ($availableCount === $totalAccommodations ? 'available' : 'partial'),
            ];
        }

        return $overview;
    }
}
