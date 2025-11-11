<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    protected $table = 'refunds';

    protected $fillable = [
        'payment_id',
        'refund_number',
        'amount',
        'refund_method',
        'refund_account_id',
        'reference_number',
        'reference_image',
        'reason',
        'notes',
        'processed_by',
        'refund_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refund_date' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function refundAccount(): BelongsTo
    {
        return $this->belongsTo(PaymentAccount::class, 'refund_account_id');
    }

    public function processedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
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

        static::creating(function ($refund) {
            if (!$refund->refund_number) {
                $refund->refund_number = self::generateRefundNumber();
            }
        });

        static::created(function ($refund) {
            $refund->payment->booking->updatePaidAmount();
        });

        static::updated(function ($refund) {
            $refund->payment->booking->updatePaidAmount();
        });

        static::deleted(function ($refund) {
            $refund->payment->booking->updatePaidAmount();
        });
    }

    private static function generateRefundNumber(): string
    {
        $year = now()->format('Y');
        $month = now()->format('m');
        $lastRefund = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->latest('id')
            ->first();

        $nextNumber = $lastRefund ? ((int) substr($lastRefund->refund_number, -4)) + 1 : 1;

        return sprintf('REF-%s%s-%04d', $year, $month, $nextNumber);
    }
}
