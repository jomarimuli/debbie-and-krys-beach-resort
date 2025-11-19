<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('payment edit') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'is_down_payment' => ['boolean'],
            'is_rebooking_payment' => ['boolean'],
            'payment_account_id' => ['nullable', 'exists:payment_accounts,id'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'reference_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp'],
            'remove_reference_image' => ['boolean'],
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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $payment = $this->route('payment');
            $booking = $payment->booking;

            // Skip booking balance validation if this is a rebooking payment
            if ($this->is_rebooking_payment || $payment->is_rebooking_payment) {
                return;
            }

            if ($this->is_down_payment) {
                // Validate as down payment
                if (!$booking->down_payment_required) {
                    $validator->errors()->add('is_down_payment', 'This booking does not require a down payment.');
                } else {
                    $otherDownPayments = $booking->payments()
                        ->where('id', '!=', $payment->id)
                        ->where('is_down_payment', true)
                        ->sum('amount');

                    $newDownPaymentBalance = $booking->down_payment_amount - $otherDownPayments - $this->amount;

                    if ($newDownPaymentBalance < 0) {
                        $availableAmount = $booking->down_payment_amount - $otherDownPayments;
                        $validator->errors()->add('amount', 'Down payment amount cannot exceed remaining balance of ₱' . number_format($availableAmount, 2) . '.');
                    }
                }
            } else {
                // Validate as regular payment
                $otherPayments = $booking->payments()->where('id', '!=', $payment->id)->sum('amount');
                $newBalance = $booking->total_amount - $otherPayments - $this->amount;

                if ($newBalance < 0) {
                    $availableAmount = $booking->total_amount - $otherPayments;
                    $validator->errors()->add('amount', 'Payment amount cannot exceed remaining balance of ₱' . number_format($availableAmount, 2) . '.');
                }
            }
        });
    }
}
