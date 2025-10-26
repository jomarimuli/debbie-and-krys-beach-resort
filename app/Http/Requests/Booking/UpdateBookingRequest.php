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
        return [
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email', 'max:255'],
            'guest_phone' => ['nullable', 'string', 'max:20'],
            'guest_address' => ['nullable', 'string', 'max:500'],
            'check_in_date' => ['required', 'date'],
            'check_out_date' => ['nullable', 'date', 'after:check_in_date'],
            'total_adults' => ['required', 'integer', 'min:1'],
            'total_children' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'status' => ['required', 'in:pending,confirmed,checked_in,checked_out,cancelled'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $booking = $this->route('booking');

            // 1. Prevent cancellation if fully paid
            if ($this->status === 'cancelled' && $booking->is_fully_paid) {
                $validator->errors()->add(
                    'status',
                    'Cannot cancel a fully paid booking. Please issue a refund first.'
                );
            }

            // 2. Prevent date changes after check-in
            if (in_array($booking->status, ['checked_in', 'checked_out'])) {
                if ($this->check_in_date !== $booking->check_in_date->format('Y-m-d')) {
                    $validator->errors()->add(
                        'check_in_date',
                        'Cannot change check-in date after guest has checked in.'
                    );
                }
            }

            // 3. Prevent un-cancellation
            if ($booking->status === 'cancelled' && $this->status !== 'cancelled') {
                $validator->errors()->add(
                    'status',
                    'Cannot reactivate a cancelled booking. Please create a new booking.'
                );
            }

            // 4. Prevent un-checkout
            if ($booking->status === 'checked_out' && $this->status !== 'checked_out') {
                $validator->errors()->add(
                    'status',
                    'Cannot change status after checkout is complete.'
                );
            }
        });
    }
}
