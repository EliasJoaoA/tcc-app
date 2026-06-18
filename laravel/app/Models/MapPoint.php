<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MapPoint extends Model
{
    protected $fillable = [
        'name',
        'description',
        'type',
        'latitude',
        'longitude',
        'floor',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sosResources(): HasMany
    {
        return $this->hasMany(SosResource::class, 'map_point_id');
    }
}
