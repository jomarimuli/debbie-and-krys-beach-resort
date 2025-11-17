<?php

namespace App\Http\Requests\Booking;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('booking edit') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        $booking = $this->route('booking');

        $rules = [
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'guest_phone' => ['nullable', 'string', 'max:20'],
            'guest_address' => ['nullable', 'string', 'max:500'],
            'check_in_date' => ['required', 'date'],
            'total_adults' => ['required', 'integer', 'min:1'],
            'total_children' => ['required', 'integer', 'min:0'],
            'down_payment_required' => ['boolean'],
            'down_payment_amount' => ['nullable', 'numeric', 'min:0.01'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'in:pending,confirmed,checked_in,checked_out,cancelled'],
        ];

        // Check-out date is required for overnight bookings
        if ($booking->booking_type === 'overnight') {
            $rules['check_out_date'] = ['required', 'date', 'after:check_in_date'];
        } else {
            $rules['check_out_date'] = ['nullable', 'date', 'after:check_in_date'];
        }

        // Down payment amount is required if down payment is enabled
        if ($this->input('down_payment_required')) {
            $rules['down_payment_amount'] = ['required', 'numeric', 'min:0.01'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'check_out_date.required' => 'Check-out date is required for overnight bookings.',
            'check_out_date.after' => 'Check-out date must be after check-in date.',
            'down_payment_amount.required' => 'Down payment amount is required when down payment is enabled.',
        ];
    }
}
