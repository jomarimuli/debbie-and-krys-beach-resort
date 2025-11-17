<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RebookingAccommodation extends Model
{
    protected $table = 'rebooking_accommodations';

    protected $fillable = [
        'rebooking_id',
        'accommodation_id',
        'accommodation_rate_id',
        'guests',
        'rate',
        'additional_pax_charge',
        'subtotal',
        'free_entrance_used',
    ];

    protected $casts = [
        'guests' => 'integer',
        'free_entrance_used' => 'integer',
        'rate' => 'decimal:2',
        'additional_pax_charge' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    // Relationships
    public function rebooking(): BelongsTo
    {
        return $this->belongsTo(Rebooking::class);
    }

    public function accommodation(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class);
    }

    public function accommodationRate(): BelongsTo
    {
        return $this->belongsTo(AccommodationRate::class);
    }
}
