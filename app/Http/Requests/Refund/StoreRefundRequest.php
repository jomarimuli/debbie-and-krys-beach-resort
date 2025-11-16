<?php

namespace App\Http\Requests\Refund;

use Illuminate\Foundation\Http\FormRequest;

class StoreRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('refund create') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'payment_id' => ['required', 'exists:payments,id'],
            'rebooking_id' => ['nullable', 'exists:rebookings,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'refund_method' => ['required', 'in:cash,bank,gcash,maya,original_method,other'],
            'is_rebooking_refund' => ['boolean'],
            'refund_account_id' => ['nullable', 'exists:payment_accounts,id'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'reference_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp'],
            'reason' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'refund_date' => ['required', 'date'],
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
            if ($this->payment_id) {
                $payment = \App\Models\Payment::find($this->payment_id);
                if ($payment && !$payment->canRefund($this->amount)) {
                    $remaining = $payment->remainingAmount();
                    $validator->errors()->add('amount', "Refund amount cannot exceed remaining amount of {$remaining}.");
                }
            }
        });
    }
}
