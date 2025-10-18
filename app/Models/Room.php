<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
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
        'has_ac',
        'free_entrance_count',
        'free_cottage_size',
        'excess_pax_fee',
        'images',
        'is_active',
    ];

    protected $casts = [
        'max_pax' => 'integer',
        'day_tour_price' => 'decimal:2',
        'overnight_price' => 'decimal:2',
        'quantity' => 'integer',
        'has_ac' => 'boolean',
        'free_entrance_count' => 'integer',
        'excess_pax_fee' => 'decimal:2',
        'images' => 'array',
        'is_active' => 'boolean',
    ];

    public function bookingItems()
    {
        return $this->morphMany(BookingItem::class, 'bookable');
    }
}
