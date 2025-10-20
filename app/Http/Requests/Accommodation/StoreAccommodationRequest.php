<?php

namespace App\Http\Requests\Accommodation;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccommodationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('accommodation create') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:room,cottage'],
            'size' => ['required', 'in:small,big'],
            'description' => ['nullable', 'string'],
            'is_air_conditioned' => ['boolean'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,jpg,png,webp'],
            'min_capacity' => ['nullable', 'integer', 'min:1'],
            'max_capacity' => ['nullable', 'integer', 'min:1', 'gte:min_capacity'],
            'quantity_available' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'images.max' => 'You can upload maximum 5 images.',
            'images.*.image' => 'Each file must be an image.',
            'images.*.mimes' => 'Images must be jpeg, jpg, png, or webp.',
        ];
    }
}
