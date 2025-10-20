<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccommodationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'description' => $this->description,
            'is_air_conditioned' => $this->is_air_conditioned,
            'images' => $this->images,
            'image_urls' => $this->image_urls,
            'first_image_url' => $this->first_image_url,
            'min_capacity' => $this->min_capacity,
            'max_capacity' => $this->max_capacity,
            'quantity_available' => $this->quantity_available,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'rates' => AccommodationRateResource::collection($this->whenLoaded('rates')),
        ];
    }
}
