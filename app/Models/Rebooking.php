<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\Casts\Attribute;

class Rebooking extends Model
{
    protected $table = 'rebookings';

    protected $fillable = [
        'rebooking_number',
        'original_booking_id',
        'processed_by',
        'new_check_in_date',
        'new_check_out_date',
        'new_total_adults',
        'new_total_children',
        'original_amount',
        'new_amount',
        'amount_difference',
        'rebooking_fee',
        'total_adjustment',
        'status',
        'payment_status',
        'reason',
        'admin_notes',
        'approved_at',
        'completed_at',
    ];

    protected $casts = [
        'new_check_in_date' => 'date',
        'new_check_out_date' => 'date',
        'new_total_adults' => 'integer',
        'new_total_children' => 'integer',
        'original_amount' => 'decimal:2',
        'new_amount' => 'decimal:2',
        'amount_difference' => 'decimal:2',
        'rebooking_fee' => 'decimal:2',
        'total_adjustment' => 'decimal:2',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $appends = [
        'new_total_guests',
        'total_paid',
        'total_refunded',
        'remaining_payment',
        'remaining_refund'
    ];

    public function originalBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'original_booking_id');
    }

    public function processedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function accommodations(): HasMany
    {
        return $this->hasMany(RebookingAccommodation::class);
    }

    public function entranceFees(): HasMany
    {
        return $this->hasMany(RebookingEntranceFee::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    protected function newTotalGuests(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->new_total_adults + $this->new_total_children
        );
    }

    protected function totalPaid(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->payments()->sum('amount')
        );
    }

    protected function totalRefunded(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->refunds()->sum('amount')
        );
    }

    protected function remainingPayment(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ((float)$this->total_adjustment <= 0) {
                    return 0;
                }

                $remaining = (float)$this->total_adjustment - (float)$this->total_paid;
                return max(0, $remaining);
            }
        );
    }

    protected function remainingRefund(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ((float)$this->total_adjustment >= 0) {
                    return 0;
                }

                $requiredRefund = abs((float)$this->total_adjustment);
                $remaining = $requiredRefund - (float)$this->total_refunded;
                return max(0, $remaining);
            }
        );
    }

    public function isPaymentComplete(): bool
    {
        $totalAdjustment = (float)$this->total_adjustment;

        if ($totalAdjustment == 0) {
            return true;
        }

        if ($totalAdjustment > 0) {
            return (float)$this->total_paid >= $totalAdjustment;
        }

        $requiredRefund = abs($totalAdjustment);
        return (float)$this->total_refunded >= $requiredRefund;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($rebooking) {
            if (!$rebooking->rebooking_number) {
                $rebooking->rebooking_number = self::generateRebookingNumber();
            }

            if (!$rebooking->processed_by) {
                $rebooking->processed_by = auth()->id();
            }
        });
    }

    private static function generateRebookingNumber(): string
    {
        $year = now()->format('Y');
        $month = now()->format('m');
        $lastRebooking = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->latest('id')
            ->first();

        $nextNumber = $lastRebooking ? ((int) substr($lastRebooking->rebooking_number, -4)) + 1 : 1;

        return sprintf('REB-%s%s-%04d', $year, $month, $nextNumber);
    }
}
