<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Accommodation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'description',
        'min_capacity',
        'max_capacity',
        'quantity_available',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function rates(): HasMany
    {
        return $this->hasMany(AccommodationRate::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRooms($query)
    {
        return $query->where('type', 'room');
    }

    public function scopeCottages($query)
    {
        return $query->where('type', 'cottage');
    }

    public function getRateForBookingType(string $bookingType): ?AccommodationRate
    {
        return $this->rates()
            ->where('booking_type', $bookingType)
            ->where('is_active', true)
            ->first();
    }
}
