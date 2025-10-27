<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

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
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cash,card,bank,gcash,maya,other'],
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

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->booking_id) {
                $booking = \App\Models\Booking::find($this->booking_id);
                if ($booking && $this->amount > $booking->balance) {
                    $validator->errors()->add('amount', 'Payment amount cannot exceed remaining balance.');
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
