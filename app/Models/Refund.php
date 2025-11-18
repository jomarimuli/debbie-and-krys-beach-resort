<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    protected $table = 'refunds';

    protected $fillable = [
        'payment_id',
        'rebooking_id',
        'refund_number',
        'amount',
        'refund_method',
        'is_rebooking_refund',
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
        'is_rebooking_refund' => 'boolean',
        'refund_date' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function rebooking(): BelongsTo
    {
        return $this->belongsTo(Rebooking::class);
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

            // Update rebooking payment status if applicable
            if ($refund->rebooking_id) {
                self::updateRebookingPaymentStatus($refund->rebooking_id);
            }
        });

        static::updated(function ($refund) {
            $refund->payment->booking->updatePaidAmount();

            if ($refund->rebooking_id) {
                self::updateRebookingPaymentStatus($refund->rebooking_id);
            }
        });

        static::deleted(function ($refund) {
            $refund->payment->booking->updatePaidAmount();

            if ($refund->rebooking_id) {
                self::updateRebookingPaymentStatus($refund->rebooking_id);
            }
        });
    }

    private static function updateRebookingPaymentStatus(int $rebookingId): void
    {
        $rebooking = \App\Models\Rebooking::find($rebookingId);

        if (!$rebooking) {
            return;
        }

        $totalAdjustment = (float)$rebooking->total_adjustment;

        // If adjustment is 0, mark as paid
        if ($totalAdjustment == 0) {
            $rebooking->update(['payment_status' => 'paid']);
            return;
        }

        // For positive adjustments (guest owes money)
        if ($totalAdjustment > 0) {
            $totalPaid = $rebooking->payments()->sum('amount');

            if ($totalPaid >= $totalAdjustment) {
                $rebooking->update(['payment_status' => 'paid']);
            } else {
                $rebooking->update(['payment_status' => 'pending']);
            }
        }

        // For negative adjustments (refund needed)
        if ($totalAdjustment < 0) {
            $totalRefunded = $rebooking->refunds()->sum('amount');
            $requiredRefund = abs($totalAdjustment);

            if ($totalRefunded >= $requiredRefund) {
                $rebooking->update(['payment_status' => 'refunded']);
            } else {
                $rebooking->update(['payment_status' => 'pending']);
            }
        }
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
