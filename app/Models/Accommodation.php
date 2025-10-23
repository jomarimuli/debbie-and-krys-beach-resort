<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Accommodation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'is_airconditioned',
        'base_capacity',
        'description',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_airconditioned' => 'boolean',
        'base_capacity' => 'integer',
    ];

    /**
     * Get the rates for this accommodation.
     */
    public function rates(): HasMany
    {
        return $this->hasMany(AccommodationRate::class);
    }

    /**
     * Get active rates only.
     */
    public function activeRates(): HasMany
    {
        return $this->rates()->where('status', 'active');
    }

    /**
     * Scope a query to only include active accommodations.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include rooms.
     */
    public function scopeRooms($query)
    {
        return $query->where('type', 'room');
    }

    /**
     * Scope a query to only include cottages.
     */
    public function scopeCottages($query)
    {
        return $query->where('type', 'cottage');
    }

    /**
     * Check if accommodation is a room.
     */
    public function isRoom(): bool
    {
        return $this->type === 'room';
    }

    /**
     * Check if accommodation is a cottage.
     */
    public function isCottage(): bool
    {
        return $this->type === 'cottage';
    }
}
