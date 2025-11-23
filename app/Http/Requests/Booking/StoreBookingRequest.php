<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\AccommodationAvailabilityService;
use App\Models\Accommodation;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('booking create') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        $rules = [
            'source' => ['required', 'in:guest,registered,walkin'],
            'booking_type' => ['required', 'in:day_tour,overnight'],
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['required', 'email', 'max:255'],
            'guest_phone' => ['required', 'string', 'max:20'],
            'guest_address' => ['required', 'string', 'max:500'],
            'check_in_date' => ['required', 'date', 'after_or_equal:today'],
            'total_adults' => ['required', 'integer', 'min:1'],
            'total_children' => ['required', 'integer', 'min:0'],
            'down_payment_required' => ['boolean'],
            'down_payment_amount' => ['nullable', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'accommodations' => ['required', 'array', 'min:1'],
            'accommodations.*.accommodation_id' => ['required', 'exists:accommodations,id'],
            'accommodations.*.accommodation_rate_id' => ['required', 'exists:accommodation_rates,id'],
            'accommodations.*.guests' => ['required', 'integer', 'min:1'],
        ];

        if ($this->input('booking_type') === 'overnight') {
            $rules['check_out_date'] = ['required', 'date', 'after:check_in_date'];
        } else {
            $rules['check_out_date'] = ['nullable', 'date', 'after:check_in_date'];
        }

        if ($this->input('down_payment_required')) {
            $rules['down_payment_amount'] = ['required', 'numeric', 'min:0.01'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'check_out_date.required' => 'Check-out date is required for overnight bookings.',
            'check_out_date.after' => 'Check-out date must be after check-in date.',
            'down_payment_amount.required' => 'Down payment amount is required when down payment is enabled.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validate guest count matches accommodations
            $totalGuests = $this->total_adults + $this->total_children;
            $accommodationGuests = collect($this->accommodations)->sum('guests');

            if ($accommodationGuests !== $totalGuests) {
                $validator->errors()->add(
                    'accommodations',
                    "Total accommodation guests ({$accommodationGuests}) must equal total party size ({$totalGuests})"
                );
            }

            // Validate max capacity for each accommodation
            foreach ($this->accommodations as $index => $accommodationData) {
                $accommodation = Accommodation::find($accommodationData['accommodation_id']);

                if ($accommodation && $accommodation->max_capacity) {
                    $guests = (int) $accommodationData['guests'];

                    if ($guests > $accommodation->max_capacity) {
                        $validator->errors()->add(
                            "accommodations.{$index}.guests",
                            "The number of guests ({$guests}) exceeds the maximum capacity ({$accommodation->max_capacity}) for {$accommodation->name}."
                        );
                    }
                }
            }

            // Check accommodation availability
            if ($this->check_in_date && $this->accommodations) {
                $availabilityService = app(AccommodationAvailabilityService::class);

                $accommodationIds = collect($this->accommodations)
                    ->pluck('accommodation_id')
                    ->unique()
                    ->toArray();

                $conflicts = $availabilityService->checkAvailability(
                    $accommodationIds,
                    $this->check_in_date,
                    $this->check_out_date
                );

                if (!empty($conflicts)) {
                    $messages = $availabilityService->formatConflictMessages($conflicts);
                    foreach ($messages as $message) {
                        $validator->errors()->add('accommodations', $message);
                    }
                }
            }
        });
    }
}
