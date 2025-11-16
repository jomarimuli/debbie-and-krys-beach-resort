<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatTypingIndicator extends Model
{
    public $timestamps = false;
    public $incrementing = false;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'last_typed_at',
    ];

    protected $casts = [
        'last_typed_at' => 'datetime',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatConversation::class, 'conversation_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isTyping(): bool
    {
        return $this->last_typed_at->greaterThan(now()->subSeconds(5));
    }

    public static function updateTyping(int $conversationId, int $userId): void
    {
        static::updateOrCreate(
            [
                'conversation_id' => $conversationId,
                'user_id' => $userId,
            ],
            [
                'last_typed_at' => now(),
            ]
        );
    }

    public static function clearTyping(int $conversationId, int $userId): void
    {
        static::where('conversation_id', $conversationId)
            ->where('user_id', $userId)
            ->delete();
    }
}
