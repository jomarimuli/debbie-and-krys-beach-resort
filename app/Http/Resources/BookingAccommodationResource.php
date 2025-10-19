<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingAccommodationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'accommodation_id' => $this->accommodation_id,
            'quantity' => $this->quantity,
            'guests' => $this->guests,
            'rate' => $this->rate,
            'additional_pax_charge' => $this->additional_pax_charge,
            'subtotal' => $this->subtotal,
            'free_entrance_used' => $this->free_entrance_used,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'accommodation' => new AccommodationResource($this->whenLoaded('accommodation')),
        ];
    }
}
