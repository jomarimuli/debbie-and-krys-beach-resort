<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class CheckOutBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('booking checkout') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'check_out_time' => ['required', 'date_format:H:i'],
            'check_out_remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
