<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'booking_number',
        'booking_type',
        'user_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'guest_address',
        'check_in_date',
        'check_out_date',
        'rental_type',
        'total_pax',
        'subtotal',
        'entrance_fee_total',
        'total_amount',
        'paid_amount',
        'balance',
        'status',
        'payment_status',
        'created_by',
        'notes',
        'cancellation_reason',
        'cancelled_at',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'total_pax' => 'integer',
        'subtotal' => 'decimal:2',
        'entrance_fee_total' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance' => 'decimal:2',
        'cancelled_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (empty($booking->booking_number)) {
                $booking->booking_number = self::generateBookingNumber();
            }
        });
    }

    public static function generateBookingNumber(): string
    {
        do {
            $number = 'BK-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
        } while (self::where('booking_number', $number)->exists());

        return $number;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function bookingItems(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    public function entranceFeeDetails(): HasMany
    {
        return $this->hasMany(EntranceFeeDetail::class);
    }

    public function getCustomerName(): string
    {
        return $this->booking_type === 'registered' ? $this->user->name : $this->guest_name;
    }

    public function getCustomerEmail(): ?string
    {
        return $this->booking_type === 'registered' ? $this->user->email : $this->guest_email;
    }

    public function getCustomerPhone(): ?string
    {
        return $this->booking_type === 'registered' ? $this->user->phone : $this->guest_phone;
    }

    public function calculateBalance(): void
    {
        $this->balance = $this->total_amount - $this->paid_amount;
        $this->save();
    }

    public function updatePaymentStatus(): void
    {
        if ($this->paid_amount == 0) {
            $this->payment_status = 'unpaid';
        } elseif ($this->paid_amount >= $this->total_amount) {
            $this->payment_status = 'paid';
        } else {
            $this->payment_status = 'partial';
        }
        $this->save();
    }
}
