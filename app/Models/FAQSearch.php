<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FAQSearch extends Model
{
    protected $table = 'faq_searches';

    protected $fillable = [
        'query',
        'faq_id',
        'was_helpful',
    ];

    protected $casts = [
        'was_helpful' => 'boolean',
    ];

    public function faq()
    {
        return $this->belongsTo(FAQ::class, 'faq_id');
    }
}
