<?php

namespace App\Http\Requests\Accommodation;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAccommodationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('accommodation edit') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:room,cottage'],
            'size' => ['required', 'in:small,big'],
            'description' => ['nullable', 'string'],
            'is_air_conditioned' => ['boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'mimes:jpeg,jpg,png,webp'],
            'existing_images' => ['nullable', 'array'],
            'existing_images.*' => ['string'],
            'min_capacity' => ['nullable', 'integer', 'min:1'],
            'max_capacity' => ['nullable', 'integer', 'min:1', 'gte:min_capacity'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'images.*.image' => 'Each file must be an image.',
            'images.*.mimes' => 'Images must be jpeg, jpg, png, or webp.',
        ];
    }
}
