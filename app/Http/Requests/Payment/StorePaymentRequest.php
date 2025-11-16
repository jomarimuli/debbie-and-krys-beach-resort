<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('payment create') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'booking_id' => ['required', 'exists:bookings,id'],
            'rebooking_id' => ['nullable', 'exists:rebookings,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'is_down_payment' => ['boolean'],
            'is_rebooking_payment' => ['boolean'],
            'payment_account_id' => ['nullable', 'exists:payment_accounts,id'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'reference_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'notes' => ['nullable', 'string'],
            'payment_date' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'reference_image.image' => 'The file must be an image.',
            'reference_image.mimes' => 'Image must be jpeg, jpg, png, or webp.',
        ];
    }

    /**
     * @param \Illuminate\Contracts\Validation\Validator $validator
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->booking_id) {
                $booking = \App\Models\Booking::find($this->booking_id);

                if ($booking) {
                    // Skip booking balance validation if this is a rebooking payment
                    if ($this->is_rebooking_payment) {
                        // Rebooking payment validation would be handled by rebooking logic
                        return;
                    }

                    // Check if this is a down payment
                    if ($this->is_down_payment) {
                        // Validate down payment
                        if (!$booking->down_payment_required) {
                            $validator->errors()->add('is_down_payment', 'This booking does not require a down payment.');
                        } elseif ($this->amount > $booking->down_payment_balance) {
                            $validator->errors()->add('amount', 'Down payment amount cannot exceed remaining down payment balance of ₱' . number_format($booking->down_payment_balance, 2) . '.');
                        }
                    } else {
                        // Regular payment validation
                        if ($this->amount > $booking->balance) {
                            $validator->errors()->add('amount', 'Payment amount cannot exceed remaining balance of ₱' . number_format($booking->balance, 2) . '.');
                        }
                    }
                }
            }

            // Validate rebooking_id is provided when is_rebooking_payment is true
            if ($this->is_rebooking_payment && !$this->rebooking_id) {
                $validator->errors()->add('rebooking_id', 'Rebooking ID is required for rebooking payments.');
            }
        });
    }
}
