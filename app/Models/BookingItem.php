<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class BookingItem extends Model
{
    protected $fillable = [
        'booking_id',
        'bookable_type',
        'bookable_id',
        'item_name',
        'item_type',
        'rental_type',
        'quantity',
        'pax',
        'unit_price',
        'total_price',
        'free_entrance_count',
        'free_cottage_size',
        'extra_pax',
        'excess_pax_fee',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'pax' => 'integer',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'free_entrance_count' => 'integer',
        'extra_pax' => 'integer',
        'excess_pax_fee' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function bookable(): MorphTo
    {
        return $this->morphTo();
    }

    public function calculateTotalPrice(): void
    {
        $this->total_price = ($this->unit_price * $this->quantity) + $this->excess_pax_fee;
        $this->save();
    }
}
