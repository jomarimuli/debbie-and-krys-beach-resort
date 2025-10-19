<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccommodationRateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'accommodation_id' => $this->accommodation_id,
            'booking_type' => $this->booking_type,
            'rate' => $this->rate,
            'base_capacity' => $this->base_capacity,
            'additional_pax_rate' => $this->additional_pax_rate,
            'entrance_fee' => $this->entrance_fee,
            'child_entrance_fee' => $this->child_entrance_fee,
            'child_max_age' => $this->child_max_age,
            'includes_free_cottage' => $this->includes_free_cottage,
            'includes_free_entrance' => $this->includes_free_entrance,
            'effective_from' => $this->effective_from?->toISOString(),
            'effective_to' => $this->effective_to?->toISOString(),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'accommodation' => new AccommodationResource($this->whenLoaded('accommodation')),
        ];
    }
}
