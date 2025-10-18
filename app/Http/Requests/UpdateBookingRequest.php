<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        if ($this->user()->can('global access')) {
            return true;
        }

        if ($this->user()->can('booking access')) {
            return true;
        }

        return $booking->user_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'check_in_date' => ['sometimes', 'date'],
            'check_out_date' => ['nullable', 'date', 'after:check_in_date'],
            'total_pax' => ['sometimes', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', Rule::in(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'])],
            'paid_amount' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
