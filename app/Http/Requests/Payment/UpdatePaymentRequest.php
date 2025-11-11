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
            'payment_method' => ['required', 'in:cash,card,bank,gcash,maya,other'],
            'is_down_payment' => ['boolean'],
            'payment_account_id' => ['nullable', 'exists:payment_accounts,id'],
            'reference_number' => ['nullable', 'string', 'max:255'],
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

    /**
     * @param \Illuminate\Contracts\Validation\Validator $validator
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $payment = $this->route('payment');
            $booking = $payment->booking;

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
                        $validator->errors()->add('amount', 'Down payment amount exceeds remaining down payment balance.');
                    }
                }
            } else {
                // Validate as regular payment
                $otherPayments = $booking->payments()->where('id', '!=', $payment->id)->sum('amount');
                $newBalance = $booking->total_amount - $otherPayments - $this->amount;

                if ($newBalance < 0) {
                    $validator->errors()->add('amount', 'Payment amount exceeds remaining balance.');
                }
            }

            if ($this->payment_account_id && $this->payment_method) {
                $paymentAccount = \App\Models\PaymentAccount::find($this->payment_account_id);
                if ($paymentAccount && $paymentAccount->type !== $this->payment_method) {
                    $validator->errors()->add('payment_account_id', 'Selected payment account does not match payment method.');
                }
            }
        });
    }
}
