<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SosResourceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'map_point' => new MapPointResource($this->whenLoaded('mapPoint')),
            'content' => $this->content,
            'is_active' => $this->is_active,
        ];
    }
}
