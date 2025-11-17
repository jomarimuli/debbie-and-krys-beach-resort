<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Payment extends Model
{
    protected $table = 'payments';

    protected $fillable = [
        'booking_id',
        'rebooking_id',
        'payment_number',
        'amount',
        'is_down_payment',
        'is_rebooking_payment',
        'payment_account_id',
        'reference_number',
        'reference_image',
        'notes',
        'received_by',
        'payment_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'is_down_payment' => 'boolean',
        'is_rebooking_payment' => 'boolean',
        'payment_date' => 'datetime',
    ];

    protected $appends = ['payment_method', 'refunded_amount', 'remaining_amount'];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function rebooking(): BelongsTo
    {
        return $this->belongsTo(Rebooking::class);
    }

    public function paymentAccount(): BelongsTo
    {
        return $this->belongsTo(PaymentAccount::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function receivedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function getPaymentMethodAttribute(): ?string
    {
        return $this->paymentAccount?->type ?? 'cash';
    }

    public function getReferenceImageUrlAttribute(): ?string
    {
        if (!$this->reference_image) {
            return null;
        }

        return asset('storage/' . $this->reference_image);
    }

    protected function refundedAmount(): Attribute
    {
        return Attribute::make(
            get: fn () => number_format($this->refunds->sum('amount'), 2, '.', '')
        );
    }

    protected function remainingAmount(): Attribute
    {
        return Attribute::make(
            get: fn () => number_format($this->amount - $this->refunds->sum('amount'), 2, '.', '')
        );
    }

    public function isFullyRefunded(): bool
    {
        return (float)$this->remaining_amount <= 0;
    }

    public function canRefund(float $amount): bool
    {
        return $amount > 0 && $amount <= (float)$this->remaining_amount;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (!$payment->payment_number) {
                $payment->payment_number = self::generatePaymentNumber();
            }
        });

        static::created(function ($payment) {
            $payment->booking->updatePaidAmount();
        });

        static::updated(function ($payment) {
            $payment->booking->updatePaidAmount();
        });

        static::deleted(function ($payment) {
            $payment->booking->updatePaidAmount();
        });
    }

    private static function generatePaymentNumber(): string
    {
        $year = now()->format('Y');
        $month = now()->format('m');
        $lastPayment = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->latest('id')
            ->first();

        $nextNumber = $lastPayment ? ((int) substr($lastPayment->payment_number, -4)) + 1 : 1;

        return sprintf('PAY-%s%s-%04d', $year, $month, $nextNumber);
    }
}
