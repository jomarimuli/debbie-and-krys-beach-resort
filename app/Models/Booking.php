<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\Casts\Attribute;

class Booking extends Model
{
    protected $table = 'bookings';

    protected $fillable = [
        'booking_number',
        'booking_code',
        'source',
        'booking_type',
        'created_by',
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
        'down_payment_amount',
        'down_payment_paid',
        'down_payment_required',
        'status',
        'notes',
    ];

    protected $casts = [
        'check_in_date' => 'date',
        'check_out_date' => 'date',
        'total_adults' => 'integer',
        'total_children' => 'integer',
        'accommodation_total' => 'decimal:2',
        'entrance_fee_total' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'down_payment_amount' => 'decimal:2',
        'down_payment_paid' => 'decimal:2',
        'down_payment_required' => 'boolean',
    ];

    protected $appends = ['balance', 'is_fully_paid', 'total_guests', 'down_payment_balance'];

    // Relationships
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

    public function rebookings(): HasMany
    {
        return $this->hasMany(Rebooking::class, 'original_booking_id');
    }

    // Accessors
    protected function balance(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->total_amount - $this->paid_amount,
        );
    }

    protected function isFullyPaid(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->balance <= 0,
        );
    }

    protected function totalGuests(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->total_adults + $this->total_children,
        );
    }

    protected function downPaymentBalance(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->down_payment_required || !$this->down_payment_amount) {
                    return 0;
                }
                return $this->down_payment_amount - $this->down_payment_paid;
            },
        );
    }

    // Helper Methods
    public function isDownPaymentPaid(): bool
    {
        if (!$this->down_payment_required || !$this->down_payment_amount) {
            return true;
        }
        return $this->down_payment_paid >= $this->down_payment_amount;
    }

    public function updatePaidAmount(): void
    {
        $totalPaid = $this->payments()->sum('amount');
        $downPaymentPaid = $this->payments()->where('is_down_payment', true)->sum('amount');

        $this->update([
            'paid_amount' => $totalPaid,
            'down_payment_paid' => $downPaymentPaid,
        ]);
    }

    // Scopes
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

    public function scopeCanBeRebooked($query)
    {
        return $query->whereIn('status', ['pending', 'confirmed'])
            ->where('check_in_date', '>', now()->toDateString());
    }

    // Boot
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (!$booking->booking_number) {
                $booking->booking_number = self::generateBookingNumber();
            }
            if (!$booking->booking_code) {
                $booking->booking_code = self::generateBookingCode();
            }
        });
    }

    // Static Methods
    public static function generateBookingNumber(): string
    {
        $yearMonth = now()->format('Ym');
        $latest = self::where('booking_number', 'like', "BK-{$yearMonth}-%")
            ->latest('id')
            ->first();

        $number = $latest ? intval(substr($latest->booking_number, -4)) + 1 : 1;

        return 'BK-' . $yearMonth . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    public static function generateBookingCode(): string
    {
        do {
            // Generate 8-character alphanumeric code (no confusing chars: 0/O, 1/I/L)
            $characters = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
            $code = '';
            for ($i = 0; $i < 8; $i++) {
                $code .= $characters[rand(0, strlen($characters) - 1)];
            }
        } while (self::where('booking_code', $code)->exists());

        return $code;
    }
}
