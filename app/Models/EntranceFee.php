<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EntranceFee extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tour_type_id',
        'age_category',
        'min_age',
        'max_age',
        'fee',
        'description',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'fee' => 'decimal:2',
        'min_age' => 'integer',
        'max_age' => 'integer',
    ];

    /**
     * Get the tour type for this entrance fee.
     */
    public function tourType(): BelongsTo
    {
        return $this->belongsTo(TourType::class);
    }

    /**
     * Scope a query to only include active entrance fees.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Check if this fee applies to a given age.
     */
    public function appliesForAge(int $age): bool
    {
        $minAgeValid = is_null($this->min_age) || $age >= $this->min_age;
        $maxAgeValid = is_null($this->max_age) || $age <= $this->max_age;

        return $minAgeValid && $maxAgeValid;
    }

    /**
     * Scope a query to fees applicable for a specific age.
     */
    public function scopeForAge($query, int $age)
    {
        return $query->where(function ($q) use ($age) {
            $q->where(function ($subQ) use ($age) {
                $subQ->whereNull('min_age')
                    ->orWhere('min_age', '<=', $age);
            })
                ->where(function ($subQ) use ($age) {
                    $subQ->whereNull('max_age')
                        ->orWhere('max_age', '>=', $age);
                });
        });
    }
}
