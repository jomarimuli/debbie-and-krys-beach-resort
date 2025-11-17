<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class AccommodationRate extends Model
{
    protected $table = 'accommodation_rates';

    protected $fillable = [
        'accommodation_id',
        'booking_type',
        'rate',
        'additional_pax_rate',
        'adult_entrance_fee',
        'child_entrance_fee',
        'child_max_age',
        'includes_free_cottage',
        'includes_free_entrance',
        'is_active',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'additional_pax_rate' => 'decimal:2',
        'adult_entrance_fee' => 'decimal:2',
        'child_entrance_fee' => 'decimal:2',
        'child_max_age' => 'integer',
        'includes_free_cottage' => 'boolean',
        'includes_free_entrance' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function accommodation(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class);
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
}
