<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Http\Requests\Chat\StoreMessageRequest;

class ChatMessageController extends Controller
{
    public function store(StoreMessageRequest $request, ChatConversation $conversation)
    {
        $user = auth()->user();

        // auto-assign logic for staff
        if ($user && !$user->hasRole('customer')) {
            if ($conversation->status === 'open') {
                $conversation->update([
                    'staff_id' => $user->id,
                    'status' => 'assigned',
                    'assigned_at' => now(),
                ]);
            } elseif ($conversation->staff_id && $conversation->staff_id !== $user->id) {
                abort(403, 'This conversation is assigned to another staff member');
            }
        }

        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user?->id,
            'sender_name' => $user ? null : $conversation->guest_name,
            'message' => $request->message,
        ]);

        $conversation->touch();

        return response()->json([
            'message' => $message->load('sender'),
        ]);
    }

    public function markAsRead(ChatConversation $conversation)
    {
        $user = auth()->user();

        if ($user) {
            // bulk update instead of each()
            $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);
        }

        return response()->json(['success' => true]);
    }
}
