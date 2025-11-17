<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentAccount extends Model
{
    protected $table = 'payment_accounts';

    protected $fillable = [
        'type',
        'account_name',
        'account_number',
        'bank_name',
        'qr_code',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getQrCodeUrlAttribute(): ?string
    {
        if (!$this->qr_code) {
            return null;
        }

        return asset('storage/' . $this->qr_code);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }
}
