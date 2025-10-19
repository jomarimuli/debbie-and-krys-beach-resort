<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingAccommodation extends Model
{
    protected $fillable = [
        'booking_id',
        'accommodation_id',
        'quantity',
        'guests',
        'rate',
        'additional_pax_charge',
        'subtotal',
        'free_entrance_used',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'additional_pax_charge' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function accommodation(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class);
    }
}
