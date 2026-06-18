<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VideoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'category' => $this->category,
            'url' => $this->url,
            'thumbnail' => $this->thumbnail ? asset('storage/' . $this->thumbnail) : null,
            'duration_seconds' => $this->duration_seconds,
            'is_active' => $this->is_active,
            'order' => $this->order,
        ];
    }
}
