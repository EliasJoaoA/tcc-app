<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    protected $fillable = [
        'user_id',
        'font_size',
        'high_contrast',
        'calm_color_scheme',
        'auto_captions',
        'reduce_animations',
        'notifications_enabled',
        'notifications_deadline_hours',
    ];

    protected function casts(): array
    {
        return [
            'high_contrast' => 'boolean',
            'auto_captions' => 'boolean',
            'reduce_animations' => 'boolean',
            'notifications_enabled' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
