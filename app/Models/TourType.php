<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TourType extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'status',
    ];

    /**
     * Get the accommodation rates for this tour type.
     */
    public function accommodationRates(): HasMany
    {
        return $this->hasMany(AccommodationRate::class);
    }

    /**
     * Get the entrance fees for this tour type.
     */
    public function entranceFees(): HasMany
    {
        return $this->hasMany(EntranceFee::class);
    }

    /**
     * Get active entrance fees.
     */
    public function activeEntranceFees(): HasMany
    {
        return $this->entranceFees()->where('status', 'active');
    }

    /**
     * Scope a query to only include active tour types.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Get entrance fee by age category.
     */
    public function getEntranceFeeByAge(int $age): ?EntranceFee
    {
        return $this->activeEntranceFees()
            ->where(function ($query) use ($age) {
                $query->where(function ($q) use ($age) {
                    $q->whereNull('min_age')
                        ->orWhere('min_age', '<=', $age);
                })
                    ->where(function ($q) use ($age) {
                        $q->whereNull('max_age')
                            ->orWhere('max_age', '>=', $age);
                    });
            })
            ->first();
    }
}
