<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SosResource extends Model
{
    protected $fillable = [
        'type',
        'title',
        'description',
        'map_point_id',
        'content',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function mapPoint(): BelongsTo
    {
        return $this->belongsTo(MapPoint::class);
    }
}
