<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $table = 'payments';

    protected $fillable = [
        'booking_id',
        'payment_number',
        'amount',
        'payment_method',
        'payment_account_id',
        'reference_number',
        'reference_image',
        'notes',
        'received_by',
        'payment_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function paymentAccount(): BelongsTo
    {
        return $this->belongsTo(PaymentAccount::class);
    }

    public function receivedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function getReferenceImageUrlAttribute(): ?string
    {
        if (!$this->reference_image) {
            return null;
        }

        return asset('storage/' . $this->reference_image);
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
