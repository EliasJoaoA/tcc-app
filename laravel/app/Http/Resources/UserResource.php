<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'course' => $this->course,
            'avatar' => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'support_contact_name' => $this->support_contact_name,
            'support_contact_phone' => $this->support_contact_phone,
            'preferences' => new UserPreferenceResource($this->whenLoaded('preferences')),
            'created_at' => $this->created_at,
        ];
    }
}
