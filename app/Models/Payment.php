<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'booking_id',
        'payment_number',
        'amount',
        'payment_method',
        'reference_number',
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

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (!$payment->payment_number) {
                $payment->payment_number = self::generatePaymentNumber();
            }
        });
    }

    public static function generatePaymentNumber(): string
    {
        $yearMonth = now()->format('Ym');
        $latest = self::where('payment_number', 'like', "PAY-{$yearMonth}-%")
            ->latest('id')
            ->first();

        $number = $latest ? intval(substr($latest->payment_number, -4)) + 1 : 1;

        return 'PAY-' . $yearMonth . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}
