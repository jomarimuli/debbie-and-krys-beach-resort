<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancelBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        // Admin with global access can update any booking
        if ($this->user()->can('global access')) {
            return true;
        }

        // Staff with booking access can update any booking
        if ($this->user()->can('booking access')) {
            return true;
        }

        // Users can only update their own bookings
        return $booking->user_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'cancellation_reason' => ['required', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'cancellation_reason.required' => 'Please provide a reason for cancellation.',
        ];
    }
}
