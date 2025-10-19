<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

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
            'payment_method' => ['required', 'in:cash,card,bank_transfer,gcash,other'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'payment_date' => ['required', 'date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $payment = $this->route('payment');
            $booking = $payment->booking;

            // Calculate balance excluding current payment
            $otherPayments = $booking->payments()->where('id', '!=', $payment->id)->sum('amount');
            $newBalance = $booking->total_amount - $otherPayments - $this->amount;

            if ($newBalance < 0) {
                $validator->errors()->add('amount', 'Payment amount exceeds remaining balance.');
            }
        });
    }
}
