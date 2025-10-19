<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_number' => $this->booking_number,
            'source' => $this->source,
            'booking_type' => $this->booking_type,
            'user_id' => $this->user_id,
            'guest_name' => $this->guest_name,
            'guest_email' => $this->guest_email,
            'guest_phone' => $this->guest_phone,
            'check_in_date' => $this->check_in_date?->toISOString(),
            'check_out_date' => $this->check_out_date?->toISOString(),
            'total_adults' => $this->total_adults,
            'total_children' => $this->total_children,
            'total_guests' => $this->total_guests,
            'accommodation_total' => $this->accommodation_total,
            'entrance_fee_total' => $this->entrance_fee_total,
            'total_amount' => $this->total_amount,
            'paid_amount' => $this->paid_amount,
            'balance' => $this->balance,
            'is_fully_paid' => $this->is_fully_paid,
            'status' => $this->status,
            'notes' => $this->notes,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_by_user' => new UserResource($this->whenLoaded('createdBy')),
            'accommodations' => BookingAccommodationResource::collection($this->whenLoaded('accommodations')),
            'entrance_fees' => BookingEntranceFeeResource::collection($this->whenLoaded('entranceFees')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
        ];
    }
}
