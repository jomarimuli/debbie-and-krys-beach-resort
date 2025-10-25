<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Payment extends Model
{
    protected $table = 'payments';

    protected $fillable = [
        'booking_id',
        'payment_number',
        'amount',
        'payment_method',
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

    protected $appends = ['reference_image_url'];

    // Relationships
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function receivedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    // Accessors
    public function getReferenceImageUrlAttribute(): ?string
    {
        if (!$this->reference_image) {
            return null;
        }

        return Storage::disk('local')->exists($this->reference_image)
            ? route('payment.reference-image', $this->id)
            : null;
    }

    // Boot
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (!$payment->payment_number) {
                $payment->payment_number = self::generatePaymentNumber();
            }
        });

        static::deleting(function ($payment) {
            if ($payment->reference_image && Storage::disk('local')->exists($payment->reference_image)) {
                Storage::disk('local')->delete($payment->reference_image);
            }
        });
    }

    // Static Methods
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
