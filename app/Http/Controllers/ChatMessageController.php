<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Http\Requests\Chat\StoreMessageRequest;
use App\Events\MessageSent;
use App\Events\ConversationUpdated;

class ChatMessageController extends Controller
{
    public function store(StoreMessageRequest $request, ChatConversation $conversation)
    {
        $user = auth()->user();

        if ($user && !$user->hasRole('customer')) {
            if ($conversation->status === 'open') {
                $conversation->update([
                    'staff_id' => $user->id,
                    'status' => 'assigned',
                    'assigned_at' => now(),
                ]);

                // broadcast(new ConversationUpdated($conversation))->toOthers();
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

        // broadcast(new MessageSent($message))->toOthers();
        // broadcast(new ConversationUpdated($conversation->fresh()))->toOthers();

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
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);

            // broadcast(new ConversationUpdated($conversation->fresh()))->toOthers();
        }

        return response()->json(['success' => true]);
    }
}
