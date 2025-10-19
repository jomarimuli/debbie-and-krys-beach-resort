<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccommodationRate extends Model
{
    protected $fillable = [
        'accommodation_id',
        'booking_type',
        'rate',
        'base_capacity',
        'additional_pax_rate',
        'entrance_fee',
        'child_entrance_fee',
        'child_max_age',
        'includes_free_cottage',
        'includes_free_entrance',
        'effective_from',
        'effective_to',
        'is_active',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'additional_pax_rate' => 'decimal:2',
        'entrance_fee' => 'decimal:2',
        'child_entrance_fee' => 'decimal:2',
        'includes_free_cottage' => 'boolean',
        'includes_free_entrance' => 'boolean',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'is_active' => 'boolean',
    ];

    public function accommodation(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeEffective($query, $date = null)
    {
        $date = $date ?? now();
        return $query->where(function ($q) use ($date) {
            $q->whereNull('effective_from')
            ->orWhere('effective_from', '<=', $date);
        })->where(function ($q) use ($date) {
            $q->whereNull('effective_to')
            ->orWhere('effective_to', '>=', $date);
        });
    }
}
