<?php

namespace App\Http\Requests\Rebooking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use App\Models\Booking;

class StoreRebookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('booking edit') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'original_booking_id' => ['required', 'exists:bookings,id'],
            'new_check_in_date' => ['required', 'date', 'after:today'],
            'new_check_out_date' => ['nullable', 'date', 'after:new_check_in_date'],
            'new_total_adults' => ['required', 'integer', 'min:1'],
            'new_total_children' => ['required', 'integer', 'min:0'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'accommodations' => ['required', 'array', 'min:1'],
            'accommodations.*.accommodation_id' => ['required', 'exists:accommodations,id'],
            'accommodations.*.accommodation_rate_id' => ['required', 'exists:accommodation_rates,id'],
            'accommodations.*.guests' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'new_check_in_date.after' => 'New check-in date must be in the future.',
            'accommodations.required' => 'Please select at least one accommodation.',
            'accommodations.*.accommodation_rate_id.required' => 'Please select a rate for each accommodation.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $booking = Booking::find($this->original_booking_id);

            // Validate booking can be rebooked
            if ($booking && !in_array($booking->status, ['pending', 'confirmed'])) {
                $validator->errors()->add(
                    'original_booking_id',
                    'Only pending or confirmed bookings can be rebooked.'
                );
            }

            // Validate booking date is in future
            if ($booking && $booking->check_in_date <= now()->toDateString()) {
                $validator->errors()->add(
                    'original_booking_id',
                    'Cannot rebook a past or current booking.'
                );
            }

            // Validate pending rebooking doesn't exist
            if ($booking && $booking->rebookings()->where('status', 'pending')->exists()) {
                $validator->errors()->add(
                    'original_booking_id',
                    'This booking already has a pending rebooking request.'
                );
            }

            // Validate guest count matches accommodations
            $totalGuests = $this->new_total_adults + $this->new_total_children;
            $accommodationGuests = collect($this->accommodations)->sum('guests');

            if ($accommodationGuests !== $totalGuests) {
                $validator->errors()->add(
                    'accommodations',
                    "Total accommodation guests ($accommodationGuests) must equal total party size ($totalGuests)"
                );
            }
        });
    }
}
