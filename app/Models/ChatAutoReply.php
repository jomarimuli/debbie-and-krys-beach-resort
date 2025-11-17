<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatAutoReply extends Model
{
    protected $fillable = [
        'trigger_type',
        'message',
        'is_active',
        'delay_seconds',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public static function getWelcomeMessage(): ?string
    {
        return self::active()
            ->where('trigger_type', 'new_conversation')
            ->first()?->message;
    }
}
