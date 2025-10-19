<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGuestBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Guest info
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['required', 'email', 'max:255'],
            'guest_phone' => ['required', 'string', 'max:20'],
            'guest_address' => ['nullable', 'string', 'max:500'],

            // Booking details
            'check_in_date' => ['required', 'date', 'after_or_equal:today'],
            'check_out_date' => [
                'nullable',
                'date',
                'after:check_in_date',
                Rule::requiredIf(fn() => $this->rental_type === 'overnight')
            ],
            'rental_type' => ['required', Rule::in(['overnight', 'day_tour'])],
            'total_pax' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],

            // Items
            'items' => ['required', 'array', 'min:1'],
            'items.*.bookable_id' => ['required', 'integer'],
            'items.*.item_name' => ['required', 'string', 'max:255'],
            'items.*.item_type' => ['required', Rule::in(['room', 'cottage'])],
            'items.*.rental_type' => ['required', Rule::in(['overnight', 'day_tour'])],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:10'],
            'items.*.pax' => ['required', 'integer', 'min:0'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],

            // Entrance fees
            'entrance_fees' => ['nullable', 'array'],
            'entrance_fees.*.entrance_fee_id' => ['nullable', 'integer', 'exists:entrance_fees,id'],
            'entrance_fees.*.fee_name' => ['required', 'string', 'max:255'],
            'entrance_fees.*.rental_type' => ['required', Rule::in(['overnight', 'day_tour'])],
            'entrance_fees.*.age_min' => ['nullable', 'integer', 'min:0'],
            'entrance_fees.*.age_max' => ['nullable', 'integer', 'gte:entrance_fees.*.age_min'],
            'entrance_fees.*.pax_count' => ['required', 'integer', 'min:0'],
            'entrance_fees.*.rate' => ['required', 'numeric', 'min:0'],
            'entrance_fees.*.free_count' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            foreach ($this->items as $index => $item) {
                $model = $item['item_type'] === 'room' ? \App\Models\Room::class : \App\Models\Cottage::class;
                $bookable = $model::find($item['bookable_id']);

                if (!$bookable || !$bookable->is_active) {
                    $validator->errors()->add("items.{$index}.bookable_id", "Selected {$item['item_type']} is not available.");
                }

                if ($bookable && $item['quantity'] > $bookable->quantity) {
                    $validator->errors()->add("items.{$index}.quantity", "Only {$bookable->quantity} {$item['item_type']}(s) available.");
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'guest_name.required' => 'Your name is required.',
            'guest_email.required' => 'Your email is required.',
            'guest_phone.required' => 'Your phone number is required.',
            'check_in_date.after_or_equal' => 'Check-in date must be today or later.',
            'check_out_date.after' => 'Check-out date must be after check-in date.',
            'items.required' => 'At least one room or cottage must be selected.',
            'entrance_fees.required' => 'Entrance fee details are required.',
        ];
    }
}
