<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'is_done',
        'due_date',
        'priority',
        'is_focus',
    ];

    protected function casts(): array
    {
        return [
            'is_done' => 'boolean',
            'is_focus' => 'boolean',
            'due_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
