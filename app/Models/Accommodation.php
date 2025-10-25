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

    // Relationships
    public function rates(): HasMany
    {
        return $this->hasMany(AccommodationRate::class);
    }

    public function bookingAccommodations(): HasMany
    {
        return $this->hasMany(BookingAccommodation::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Methods
    public function getRateForBookingType(string $bookingType)
    {
        return $this->rates()
            ->where('booking_type', $bookingType)
            ->where('is_active', true)
            ->first();
    }

    // Availability check
    public function isAvailableForDates($checkIn, $checkOut): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $hasConflict = $this->bookingAccommodations()
            ->whereHas('booking', function($query) use ($checkIn, $checkOut) {
                $query->whereIn('status', ['confirmed', 'checked-in'])
                    ->where(function($q) use ($checkIn, $checkOut) {
                        $q->whereBetween('check_in_date', [$checkIn, $checkOut])
                        ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                        ->orWhere(function($sub) use ($checkIn, $checkOut) {
                            $sub->where('check_in_date', '<=', $checkIn)
                                ->where('check_out_date', '>=', $checkOut);
                        });
                    });
            })
            ->exists();

        return !$hasConflict;
    }

    // Accessors
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
