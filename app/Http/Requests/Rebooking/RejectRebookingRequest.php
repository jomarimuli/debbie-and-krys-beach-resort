<?php

namespace App\Http\Requests\Rebooking;

use Illuminate\Foundation\Http\FormRequest;

class RejectRebookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('booking edit') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'admin_notes' => ['required', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'admin_notes.required' => 'Please provide a reason for rejection.',
        ];
    }
}
