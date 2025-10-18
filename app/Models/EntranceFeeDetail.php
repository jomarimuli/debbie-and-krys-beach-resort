<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EntranceFeeDetail extends Model
{
    protected $fillable = [
        'booking_id',
        'entrance_fee_id',
        'fee_name',
        'rental_type',
        'age_min',
        'age_max',
        'pax_count',
        'rate',
        'total',
        'free_count',
        'paid_count',
    ];

    protected $casts = [
        'age_min' => 'integer',
        'age_max' => 'integer',
        'pax_count' => 'integer',
        'rate' => 'decimal:2',
        'total' => 'decimal:2',
        'free_count' => 'integer',
        'paid_count' => 'integer',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function entranceFee(): BelongsTo
    {
        return $this->belongsTo(EntranceFee::class);
    }

    public function calculateTotal(): void
    {
        $this->paid_count = $this->pax_count - $this->free_count;
        $this->total = $this->paid_count * $this->rate;
        $this->save();
    }
}
