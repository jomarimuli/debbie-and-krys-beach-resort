<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RebookingEntranceFee extends Model
{
    protected $table = 'rebooking_entrance_fees';

    protected $fillable = [
        'rebooking_id',
        'type',
        'quantity',
        'rate',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'rate' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    // Relationships
    public function rebooking(): BelongsTo
    {
        return $this->belongsTo(Rebooking::class);
    }
}
