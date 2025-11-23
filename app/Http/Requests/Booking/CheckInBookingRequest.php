<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class CheckInBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('booking checkin') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'check_in_time' => ['required', 'date_format:H:i'],
            'check_in_remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
