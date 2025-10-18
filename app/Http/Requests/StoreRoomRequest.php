<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('global access') || $this->user()->can('room access');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'size' => ['required', 'string', 'in:big,small'],
            'description' => ['nullable', 'string'],
            'max_pax' => ['required', 'integer', 'min:1'],
            'day_tour_price' => ['required', 'numeric', 'min:0'],
            'overnight_price' => ['nullable', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'has_ac' => ['required', 'boolean'],
            'free_entrance_count' => ['required', 'integer', 'min:0'],
            'free_cottage_size' => ['nullable', 'string', 'in:big,small'],
            'excess_pax_fee' => ['required', 'numeric', 'min:0'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,jpg,png,webp'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
