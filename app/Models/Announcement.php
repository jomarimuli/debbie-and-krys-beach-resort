<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $table = 'announcements';

    protected $fillable = [
        'title',
        'content',
        'is_active',
        'published_at',
        'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePublished($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('published_at')
            ->orWhere('published_at', '<=', now());
        });
    }

    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
            ->orWhere('expires_at', '>', now());
        });
    }

    public function scopeCurrent($query)
    {
        return $query->active()->published()->notExpired();
    }
}
