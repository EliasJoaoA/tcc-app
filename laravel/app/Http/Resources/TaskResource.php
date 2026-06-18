<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'is_done' => $this->is_done,
            'due_date' => $this->due_date,
            'priority' => $this->priority,
            'is_focus' => $this->is_focus,
        ];
    }
}
