<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserPreferenceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'font_size' => $this->font_size,
            'high_contrast' => $this->high_contrast,
            'calm_color_scheme' => $this->calm_color_scheme,
            'auto_captions' => $this->auto_captions,
            'reduce_animations' => $this->reduce_animations,
            'notifications_enabled' => $this->notifications_enabled,
            'notifications_deadline_hours' => $this->notifications_deadline_hours,
        ];
    }
}
