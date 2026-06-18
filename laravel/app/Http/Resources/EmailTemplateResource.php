<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmailTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'category' => $this->category,
            'subject' => $this->subject,
            'body' => $this->body,
            'is_active' => $this->is_active,
            'order' => $this->order,
        ];
    }
}
