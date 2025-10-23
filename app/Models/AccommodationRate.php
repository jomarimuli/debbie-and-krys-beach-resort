<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccommodationRate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'accommodation_id',
        'tour_type_id',
        'base_rate',
        'included_guests',
        'additional_guest_rate',
        'free_cottage_id',
        'free_entrance_count',
        'notes',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'base_rate' => 'decimal:2',
        'additional_guest_rate' => 'decimal:2',
        'included_guests' => 'integer',
        'free_entrance_count' => 'integer',
    ];

    /**
     * Get the accommodation for this rate.
     */
    public function accommodation(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class);
    }

    /**
     * Get the tour type for this rate.
     */
    public function tourType(): BelongsTo
    {
        return $this->belongsTo(TourType::class);
    }

    /**
     * Get the free cottage (if any) included with this rate.
     */
    public function freeCottage(): BelongsTo
    {
        return $this->belongsTo(Accommodation::class, 'free_cottage_id');
    }

    /**
     * Scope a query to only include active rates.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Calculate total rate for given number of guests.
     */
    public function calculateTotalRate(int $guests): float
    {
        $total = (float) $this->base_rate;

        // Add additional guest charges if guests exceed included count
        if ($guests > $this->included_guests && $this->additional_guest_rate) {
            $additionalGuests = $guests - $this->included_guests;
            $total += $additionalGuests * (float) $this->additional_guest_rate;
        }

        return $total;
    }

    /**
     * Check if this rate includes a free cottage.
     */
    public function hasFreeCottage(): bool
    {
        return ! is_null($this->free_cottage_id);
    }

    /**
     * Check if this rate includes free entrance.
     */
    public function hasFreeEntrance(): bool
    {
        return $this->free_entrance_count > 0;
    }
}
