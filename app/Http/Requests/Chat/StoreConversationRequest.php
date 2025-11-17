<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check()
            ? auth()->user()->can('chat access') || auth()->user()->can('global access')
            : true; // guests allowed
    }

    public function rules(): array
    {
        return auth()->check() ? [
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
        ] : [
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['required', 'email', 'max:255'],
        ];
    }
}
