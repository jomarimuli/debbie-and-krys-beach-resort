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
            'phone' => $this->phone,
            'address' => $this->address,
            'avatar' => $this->avatar,
            'google_id' => $this->google_id,
            'status' => $this->status,
            'is_locked' => $this->is_locked,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'password_changed_at' => $this->password_changed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Spatie Roles & Permissions (only when loaded)
            'roles' => $this->when(
                $this->relationLoaded('roles'),
                fn() => $this->roles->pluck('name')
            ),
            'permissions' => $this->when(
                $this->relationLoaded('permissions'),
                fn() => $this->permissions->pluck('name')
            ),
        ];
    }
}
