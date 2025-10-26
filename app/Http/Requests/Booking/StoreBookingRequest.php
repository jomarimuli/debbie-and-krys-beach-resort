<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('booking create') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'source' => ['required', 'in:guest,registered,walkin'],
            'booking_type' => ['required', 'in:day_tour,overnight'],
            'created_by' => ['nullable', 'exists:users,id'],
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'guest_phone' => ['nullable', 'string', 'max:20'],
            'guest_address' => ['nullable', 'string', 'max:500'],
            'check_in_date' => ['required', 'date', 'after_or_equal:today'],
            'check_out_date' => ['nullable', 'date', 'after:check_in_date'],
            'total_adults' => ['required', 'integer', 'min:1'],
            'total_children' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'accommodations' => ['required', 'array', 'min:1'],
            'accommodations.*.accommodation_id' => ['required', 'exists:accommodations,id'],
            'accommodations.*.accommodation_rate_id' => ['required', 'exists:accommodation_rates,id'],
            'accommodations.*.guests' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'check_in_date.after_or_equal' => 'Check-in date cannot be in the past.',
            'accommodations.required' => 'Please select at least one accommodation.',
            'accommodations.*.accommodation_rate_id.required' => 'Please select a rate for each accommodation.',
            'accommodations.*.accommodation_rate_id.exists' => 'The selected rate is invalid.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $totalGuests = $this->total_adults + $this->total_children;
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
