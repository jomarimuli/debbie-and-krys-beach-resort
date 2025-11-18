<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Accommodation extends Model
{
    protected $table = 'accommodations';

    protected $fillable = [
        'name',
        'type',
        'size',
        'description',
        'is_air_conditioned',
        'images',
        'min_capacity',
        'max_capacity',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_air_conditioned' => 'boolean',
        'images' => 'array',
        'min_capacity' => 'integer',
        'max_capacity' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['image_urls', 'first_image_url'];

    public function rates(): HasMany
    {
        return $this->hasMany(AccommodationRate::class);
    }

    public function bookingAccommodations(): HasMany
    {
        return $this->hasMany(BookingAccommodation::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getRateForBookingType(string $bookingType)
    {
        return $this->rates()
            ->where('booking_type', $bookingType)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Check availability considering rebookings
     */
    public function isAvailableForDates($checkIn, $checkOut, $excludeBookingId = null): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $checkInDate = is_string($checkIn) ? \Carbon\Carbon::parse($checkIn) : $checkIn;
        $checkOutDate = $checkOut ? (is_string($checkOut) ? \Carbon\Carbon::parse($checkOut) : $checkOut) : $checkInDate->copy();

        // Get bookings for this accommodation
        $conflictingBookings = $this->bookingAccommodations()
            ->whereHas('booking', function($query) use ($checkInDate, $checkOutDate, $excludeBookingId) {
                $query->whereIn('status', ['pending', 'confirmed', 'checked_in'])
                    ->when($excludeBookingId, fn($q) => $q->where('id', '!=', $excludeBookingId))
                    ->where(function($q) use ($checkInDate, $checkOutDate) {
                        $q->whereBetween('check_in_date', [$checkInDate, $checkOutDate])
                            ->orWhereBetween('check_out_date', [$checkInDate, $checkOutDate])
                            ->orWhere(function($sub) use ($checkInDate, $checkOutDate) {
                                $sub->where('check_in_date', '<=', $checkInDate)
                                    ->where('check_out_date', '>=', $checkOutDate);
                            });
                    });
            })
            ->with('booking.rebookings')
            ->get();

        foreach ($conflictingBookings as $bookingAccommodation) {
            $booking = $bookingAccommodation->booking;

            // Check if there's an approved rebooking
            $approvedRebooking = $booking->rebookings()
                ->where('status', 'approved')
                ->latest()
                ->first();

            if ($approvedRebooking) {
                // Use rebooking dates
                $rebookCheckIn = \Carbon\Carbon::parse($approvedRebooking->new_check_in_date);
                $rebookCheckOut = $approvedRebooking->new_check_out_date
                    ? \Carbon\Carbon::parse($approvedRebooking->new_check_out_date)
                    : $rebookCheckIn->copy();

                if ($this->datesOverlap($checkInDate, $checkOutDate, $rebookCheckIn, $rebookCheckOut)) {
                    return false;
                }
            } else {
                // Use original booking dates
                $bookingCheckIn = \Carbon\Carbon::parse($booking->check_in_date);
                $bookingCheckOut = $booking->check_out_date
                    ? \Carbon\Carbon::parse($booking->check_out_date)
                    : $bookingCheckIn->copy();

                if ($this->datesOverlap($checkInDate, $checkOutDate, $bookingCheckIn, $bookingCheckOut)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Check if two date ranges overlap
     */
    private function datesOverlap($start1, $end1, $start2, $end2): bool
    {
        return $start1->lte($end2) && $end1->gte($start2);
    }

    public function getImageUrlsAttribute(): array
    {
        if (!$this->images) {
            return [];
        }

        return array_map(fn($path) => asset('storage/' . $path), $this->images);
    }

    public function getFirstImageUrlAttribute(): ?string
    {
        return $this->image_urls[0] ?? null;
    }
}
