<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $conversation = $this->route('conversation');
        $user = auth()->user();

        if (!$user) {
            // guest can reply to their own conversation
            return $conversation->guest_session_id === session('guest_chat_session_id');
        }

        if (!$user->can('chat access') && !$user->can('global access')) {
            return false;
        }

        // customer can only reply to own conversations
        if ($user->hasRole('customer')) {
            return $conversation->customer_id === $user->id;
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:1000'],
        ];
    }
}
