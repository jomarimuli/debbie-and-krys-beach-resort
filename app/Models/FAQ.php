<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FAQ extends Model
{
    protected $table = 'faqs';

    protected $fillable = [
        'question',
        'answer',
        'keywords',
        'is_active',
        'order',
    ];

    protected $casts = [
        'keywords' => 'array',
        'is_active' => 'boolean',
    ];

    public function searches()
    {
        return $this->hasMany(FAQSearch::class, 'faq_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('created_at');
    }

    public static function search(string $query)
    {
        $query = strtolower($query);

        return self::active()
            ->where(function ($q) use ($query) {
                $q->whereRaw('LOWER(question) LIKE ?', ["%{$query}%"])
                ->orWhereRaw('LOWER(answer) LIKE ?', ["%{$query}%"])
                ->orWhereRaw('LOWER(keywords) LIKE ?', ["%{$query}%"]);
            })
            ->ordered()
            ->get();
    }
}
