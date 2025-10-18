<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cottage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'size',
        'description',
        'max_pax',
        'day_tour_price',
        'overnight_price',
        'quantity',
        'images',
        'is_active',
    ];

    protected $casts = [
        'max_pax' => 'integer',
        'day_tour_price' => 'decimal:2',
        'overnight_price' => 'decimal:2',
        'quantity' => 'integer',
        'images' => 'array',
        'is_active' => 'boolean',
    ];

    public function bookingItems()
    {
        return $this->morphMany(BookingItem::class, 'bookable');
    }
}
