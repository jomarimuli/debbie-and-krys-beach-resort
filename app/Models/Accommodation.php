<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Accommodation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'description',
        'is_air_conditioned',
        'images',
        'min_capacity',
        'max_capacity',
        'quantity_available',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_air_conditioned' => 'boolean',
        'images' => 'array',
        'min_capacity' => 'integer',
        'max_capacity' => 'integer',
        'quantity_available' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Add this to always append these attributes
    protected $appends = ['image_urls', 'first_image_url'];

    public function rates(): HasMany
    {
        return $this->hasMany(AccommodationRate::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getRateForBookingType(string $bookingType)
    {
        return $this->rates()
            ->where('booking_type', $bookingType)
            ->where('is_active', true)
            ->first();
    }

    public function getImageUrlsAttribute(): array
    {
        if (!$this->images) {
            return [];
        }

        return array_map(function ($path) {
            return asset('storage/' . $path);
        }, $this->images);
    }

    public function getFirstImageUrlAttribute(): ?string
    {
        return $this->image_urls[0] ?? null;
    }
}
