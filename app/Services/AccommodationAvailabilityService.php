<?php

namespace App\Services;

use App\Models\Accommodation;
use App\Models\Booking;
use App\Models\Rebooking;
use Carbon\Carbon;

class AccommodationAvailabilityService
{
    /**
     * Check if accommodations are available for given dates
     */
    public function checkAvailability(
        array $accommodationIds,
        string $checkInDate,
        ?string $checkOutDate = null,
        ?int $excludeBookingId = null
    ): array {
        $conflicts = [];

        foreach ($accommodationIds as $accommodationId) {
            $conflict = $this->getConflictingBooking($accommodationId, $checkInDate, $checkOutDate, $excludeBookingId);

            if ($conflict) {
                $conflicts[] = [
                    'accommodation_id' => $accommodationId,
                    'accommodation_name' => $conflict['accommodation_name'],
                    'conflict_type' => $conflict['conflict_type'],
                    'booking_number' => $conflict['booking_number'],
                    'check_in_date' => $conflict['check_in_date'],
                    'check_out_date' => $conflict['check_out_date'],
                ];
            }
        }

        return $conflicts;
    }

    /**
     * Get conflicting booking for an accommodation
     */
    private function getConflictingBooking(
        int $accommodationId,
        string $checkInDate,
        ?string $checkOutDate,
        ?int $excludeBookingId
    ): ?array {
        $checkIn = Carbon::parse($checkInDate);
        $checkOut = $checkOutDate ? Carbon::parse($checkOutDate) : $checkIn->copy();

        // Check for active bookings with pending/approved rebookings
        $conflictingBooking = Booking::whereHas('accommodations', function ($query) use ($accommodationId) {
                $query->where('accommodation_id', $accommodationId);
            })
            ->whereIn('status', ['pending', 'confirmed', 'checked_in'])
            ->when($excludeBookingId, fn($q) => $q->where('id', '!=', $excludeBookingId))
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->where(function ($q) use ($checkIn, $checkOut) {
                    // Original booking dates overlap
                    $q->whereBetween('check_in_date', [$checkIn, $checkOut])
                        ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                        ->orWhere(function ($sub) use ($checkIn, $checkOut) {
                            $sub->where('check_in_date', '<=', $checkIn)
                                ->where('check_out_date', '>=', $checkOut);
                        });
                });
            })
            ->with(['accommodations' => fn($q) => $q->where('accommodation_id', $accommodationId)])
            ->first();

        if ($conflictingBooking) {
            // Check if there's an approved rebooking that changes the dates
            $approvedRebooking = $conflictingBooking->rebookings()
                ->where('status', 'approved')
                ->latest()
                ->first();

            if ($approvedRebooking) {
                // Check if rebooking dates conflict
                $rebookingCheckIn = Carbon::parse($approvedRebooking->new_check_in_date);
                $rebookingCheckOut = $approvedRebooking->new_check_out_date
                    ? Carbon::parse($approvedRebooking->new_check_out_date)
                    : $rebookingCheckIn->copy();

                $hasRebookingConflict = $this->datesOverlap(
                    $checkIn,
                    $checkOut,
                    $rebookingCheckIn,
                    $rebookingCheckOut
                );

                if ($hasRebookingConflict) {
                    return [
                        'accommodation_name' => $conflictingBooking->accommodations->first()->accommodation->name,
                        'conflict_type' => 'rebooking',
                        'booking_number' => $conflictingBooking->booking_number,
                        'rebooking_number' => $approvedRebooking->rebooking_number,
                        'check_in_date' => $approvedRebooking->new_check_in_date,
                        'check_out_date' => $approvedRebooking->new_check_out_date,
                    ];
                }

                // Approved rebooking doesn't conflict, so original booking is effectively moved
                return null;
            }

            // Check if there's a pending rebooking
            $pendingRebooking = $conflictingBooking->rebookings()
                ->where('status', 'pending')
                ->latest()
                ->first();

            if ($pendingRebooking) {
                // Pending rebooking exists - use original dates for conflict check
                return [
                    'accommodation_name' => $conflictingBooking->accommodations->first()->accommodation->name,
                    'conflict_type' => 'booking_with_pending_rebooking',
                    'booking_number' => $conflictingBooking->booking_number,
                    'rebooking_number' => $pendingRebooking->rebooking_number,
                    'check_in_date' => $conflictingBooking->check_in_date->format('Y-m-d'),
                    'check_out_date' => $conflictingBooking->check_out_date?->format('Y-m-d'),
                ];
            }

            // No rebooking - use original dates
            return [
                'accommodation_name' => $conflictingBooking->accommodations->first()->accommodation->name,
                'conflict_type' => 'booking',
                'booking_number' => $conflictingBooking->booking_number,
                'check_in_date' => $conflictingBooking->check_in_date->format('Y-m-d'),
                'check_out_date' => $conflictingBooking->check_out_date?->format('Y-m-d'),
            ];
        }

        return null;
    }

    /**
     * Check if two date ranges overlap
     */
    private function datesOverlap(Carbon $start1, Carbon $end1, Carbon $start2, Carbon $end2): bool
    {
        return $start1->lte($end2) && $end1->gte($start2);
    }

    /**
     * Format conflicts into error messages
     */
    public function formatConflictMessages(array $conflicts): array
    {
        return array_map(function ($conflict) {
            $message = "Accommodation '{$conflict['accommodation_name']}' is not available. ";

            switch ($conflict['conflict_type']) {
                case 'rebooking':
                    $message .= "Conflicting with rebooking {$conflict['rebooking_number']} ";
                    $message .= "(originally {$conflict['booking_number']}) ";
                    break;
                case 'booking_with_pending_rebooking':
                    $message .= "Booking {$conflict['booking_number']} has pending rebooking {$conflict['rebooking_number']}. ";
                    break;
                default:
                    $message .= "Conflicting with booking {$conflict['booking_number']} ";
                    break;
            }

            $message .= "from {$conflict['check_in_date']}";
            if ($conflict['check_out_date']) {
                $message .= " to {$conflict['check_out_date']}";
            }

            return $message;
        }, $conflicts);
    }
}
