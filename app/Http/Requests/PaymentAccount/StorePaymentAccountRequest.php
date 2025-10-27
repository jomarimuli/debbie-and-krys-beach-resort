<?php

namespace App\Http\Requests\PaymentAccount;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('payment-account create') || $this->user()->can('global access');
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:bank,gcash,maya,other'],
            'account_name' => ['required', 'string', 'max:255'],
            'account_number' => ['nullable', 'string', 'max:255'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'qr_code' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'qr_code.image' => 'The file must be an image.',
            'qr_code.mimes' => 'QR code must be jpeg, jpg, png, or webp.',
            'qr_code.max' => 'QR code size must not exceed 2MB.',
        ];
    }
}
