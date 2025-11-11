<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\Casts\Attribute;

class Rebooking extends Model
{
    protected $table = 'rebookings';

    protected $fillable = [
        'original_booking_id',
        'rebooking_number',
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

    protected $appends = ['new_total_guests'];

    // Relationships
    public function originalBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'original_booking_id');
    }

    public function processedBy(): BelongsTo
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

    public function processedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    // Accessors
    protected function newTotalGuests(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->new_total_adults + $this->new_total_children,
        );
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    // Boot
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($rebooking) {
            if (!$rebooking->rebooking_number) {
                $rebooking->rebooking_number = self::generateRebookingNumber();
            }
        });
    }

    // Static Methods
    public static function generateRebookingNumber(): string
    {
        $yearMonth = now()->format('Ym');
        $latest = self::where('rebooking_number', 'like', "RB-{$yearMonth}-%")
            ->latest('id')
            ->first();

        $number = $latest ? intval(substr($latest->rebooking_number, -4)) + 1 : 1;

        return 'RB-' . $yearMonth . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
}
