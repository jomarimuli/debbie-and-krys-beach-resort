<?php

namespace App\Http\Requests\AccommodationRate;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAccommodationRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('accommodation-rate edit') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'accommodation_id' => [
                'required',
                'exists:accommodations,id',
                Rule::unique('accommodation_rates')
                    ->where('accommodation_id', $this->accommodation_id)
                    ->where('booking_type', $this->booking_type)
                    ->ignore($this->route('accommodation_rate'))
            ],
            'booking_type' => ['required', 'in:day_tour,overnight'],
            'rate' => ['required', 'numeric', 'min:0'],
            'base_capacity' => ['nullable', 'integer', 'min:1'],
            'additional_pax_rate' => ['nullable', 'numeric', 'min:0'],
            'entrance_fee' => ['nullable', 'numeric', 'min:0'],
            'child_entrance_fee' => ['nullable', 'numeric', 'min:0'],
            'child_max_age' => ['nullable', 'integer', 'min:1', 'max:17'],
            'includes_free_cottage' => ['boolean'],
            'includes_free_entrance' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'accommodation_id.unique' => 'A rate for this accommodation and booking type already exists.',
        ];
    }
}
