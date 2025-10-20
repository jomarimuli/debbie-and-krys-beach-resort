<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'booking_number',
        'source',
        'booking_type',
        'user_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'guest_address',
        'check_in_date',
        'check_out_date',
        'total_adults',
        'total_children',
        'accommodation_total',
        'entrance_fee_total',
        'total_amount',
        'paid_amount',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'accommodation_total' => 'decimal:2',
        'entrance_fee_total' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function accommodations(): HasMany
    {
        return $this->hasMany(BookingAccommodation::class);
    }

    public function entranceFees(): HasMany
    {
        return $this->hasMany(BookingEntranceFee::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getBalanceAttribute(): float
    {
        return $this->total_amount - $this->paid_amount;
    }

    public function getIsFullyPaidAttribute(): bool
    {
        return $this->balance <= 0;
    }

    public function getTotalGuestsAttribute(): int
    {
        return $this->total_adults + $this->total_children;
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed'])
            ->where('check_in_date', '>=', now()->toDateString());
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (!$booking->booking_number) {
                $booking->booking_number = self::generateBookingNumber();
            }
        });
    }

    public static function generateBookingNumber(): string
    {
        $yearMonth = now()->format('Ym');
        $latest = self::where('booking_number', 'like', "BK-{$yearMonth}-%")
            ->latest('id')
            ->first();

        $number = $latest ? intval(substr($latest->booking_number, -4)) + 1 : 1;

        return 'BK-' . $yearMonth . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}
