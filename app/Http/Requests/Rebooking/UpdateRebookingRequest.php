<?php

namespace App\Http\Requests\Rebooking;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\AccommodationAvailabilityService;

class UpdateRebookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('booking edit') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $rebooking = $this->route('rebooking');

            // Only pending rebookings can be updated
            if ($rebooking && $rebooking->status !== 'pending') {
                $validator->errors()->add(
                    'status',
                    'Only pending rebookings can be updated.'
                );
            }

            // Validate guest count matches accommodations
            $totalGuests = $this->new_total_adults + $this->new_total_children;
            $accommodationGuests = collect($this->accommodations)->sum('guests');

            if ($accommodationGuests !== $totalGuests) {
                $validator->errors()->add(
                    'accommodations',
                    "Total accommodation guests ({$accommodationGuests}) must equal total party size ({$totalGuests})"
                );
            }

            // Check accommodation availability
            if ($rebooking && $this->new_check_in_date && $this->accommodations) {
                $availabilityService = app(AccommodationAvailabilityService::class);

                $accommodationIds = collect($this->accommodations)
                    ->pluck('accommodation_id')
                    ->unique()
                    ->toArray();

                // Exclude the original booking when checking availability
                $conflicts = $availabilityService->checkAvailability(
                    $accommodationIds,
                    $this->new_check_in_date,
                    $this->new_check_out_date,
                    $rebooking->original_booking_id
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
