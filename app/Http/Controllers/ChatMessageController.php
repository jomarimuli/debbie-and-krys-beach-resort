<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ChatMessageController extends Controller
{
    public function store(Request $request, ChatConversation $conversation)
    {
        $user = auth()->user();

        Log::info('Chat message store called', [
            'conversation_id' => $conversation->id ?? 'null',
            'user_id' => auth()->id(),
            'request_data' => $request->all()
        ]);

        if ($user) {
            if (!$user->can('chat access') && !$user->can('global access')) {
                abort(403);
            }

            // Customer can only reply to their own conversations
            if ($user->hasRole('customer') && $conversation->customer_id !== $user->id) {
                abort(403, 'You can only reply to your own conversations');
            }

            // Staff auto-assign logic
            if (!$user->hasRole('customer')) {
                // If conversation is open, auto-assign to this staff
                if ($conversation->status === 'open') {
                    $conversation->update([
                        'staff_id' => $user->id,
                        'status' => 'assigned',
                        'assigned_at' => now(),
                    ]);
                }
                // If already assigned to another staff, prevent reply
                elseif ($conversation->staff_id && $conversation->staff_id !== $user->id) {
                    abort(403, 'This conversation is assigned to another staff member');
                }
            }
        }

        $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

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
            $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->each(fn($message) => $message->markAsRead());
        }

        return response()->json(['success' => true]);
    }
}
