<?php

namespace App\Http\Requests\Rebooking;

use Illuminate\Foundation\Http\FormRequest;

class ApproveRebookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('booking edit') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'admin_notes' => ['nullable', 'string', 'max:1000'],
            'rebooking_fee' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'rebooking_fee.min' => 'Rebooking fee cannot be negative.',
        ];
    }
}
