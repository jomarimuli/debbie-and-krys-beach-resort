<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'payment_number' => $this->payment_number,
            'amount' => $this->amount,
            'payment_method' => $this->payment_method,
            'reference_number' => $this->reference_number,
            'reference_image' => $this->reference_image,
            'reference_image_url' => $this->reference_image_url,
            'notes' => $this->notes,
            'received_by' => $this->received_by,
            'payment_date' => $this->payment_date?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'booking' => new BookingResource($this->whenLoaded('booking')),
            'received_by_user' => new UserResource($this->whenLoaded('receivedBy')),
        ];
    }
}
