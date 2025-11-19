<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\ChatAutoReply;
use App\Http\Requests\Chat\StoreConversationRequest;
use App\Events\MessageSent;
use App\Events\ConversationUpdated;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ChatConversationController extends Controller
{
    public function index()
    {
        if (auth()->check() && !auth()->user()->can('chat access') && !auth()->user()->can('global access')) {
            abort(403);
        }

        $user = auth()->user();
        $query = ChatConversation::with(['customer', 'staff', 'latestMessage'])
            ->withCount('messages');

        if ($user && $user->hasRole('customer')) {
            $query->forCustomer($user->id);
        }

        $conversations = $query->latest('updated_at')->get();

        // Calculate total unread count
        $totalUnreadCount = $conversations->sum('unread_messages_count');

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
            'totalUnreadCount' => $totalUnreadCount,
        ]);
    }

    public function store(StoreConversationRequest $request)
    {
        $validated = $request->validated();

        $conversationData = [
            'subject' => $validated['subject'] ?? null,
            'status' => 'open',
        ];

        if (auth()->check()) {
            $conversationData['customer_id'] = auth()->id();
        } else {
            $conversationData = array_merge($conversationData, [
                'guest_session_id' => $this->getOrCreateGuestSession(),
                'guest_name' => $validated['guest_name'],
                'guest_email' => $validated['guest_email'],
            ]);
        }

        $conversation = ChatConversation::create($conversationData);

        $userMessage = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => auth()->id(),
            'sender_name' => $validated['guest_name'] ?? null,
            'message' => $validated['message'],
        ]);

        // broadcast(new MessageSent($userMessage))->toOthers();

        $autoReply = ChatAutoReply::getWelcomeMessage();
        if ($autoReply) {
            $delaySeconds = ChatAutoReply::active()
                ->where('trigger_type', 'new_conversation')
                ->first()?->delay_seconds ?? 0;

            if ($delaySeconds > 0) {
                sleep($delaySeconds);
            }

            $autoReplyMessage = ChatMessage::create([
                'conversation_id' => $conversation->id,
                'sender_id' => null,
                'sender_name' => 'System',
                'message' => $autoReply,
            ]);

            // broadcast(new MessageSent($autoReplyMessage))->toOthers();
        }

        // broadcast(new ConversationUpdated($conversation->fresh()))->toOthers();

        return redirect()->route('chat.show', $conversation)
            ->with('success', 'Chat conversation started');
    }

    public function show(ChatConversation $conversation)
    {
        $user = auth()->user();

        if ($user) {
            if (!$user->can('chat access') && !$user->can('global access')) {
                abort(403);
            }

            if ($user->hasRole('customer') && $conversation->customer_id !== $user->id) {
                abort(403);
            }

            // Mark messages as read
            $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);
        } else {
            if ($conversation->guest_session_id !== session('guest_chat_session_id')) {
                abort(403);
            }

            // Mark messages as read for guest (system/staff messages)
            $conversation->messages()
                ->whereNotNull('sender_id')
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);
        }

        $conversation->load(['customer', 'staff', 'messages.sender']);

        return Inertia::render('chat/show', [
            'conversation' => $conversation,
        ]);
    }

    public function assign(ChatConversation $conversation)
    {
        if (!auth()->user()->can('chat assign') && !auth()->user()->can('global access')) {
            abort(403);
        }

        $conversation->update([
            'staff_id' => auth()->id(),
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);

        // broadcast(new ConversationUpdated($conversation->fresh()))->toOthers();

        return back()->with('success', 'Conversation assigned to you');
    }

    public function close(ChatConversation $conversation)
    {
        if (!auth()->user()->can('chat close') && !auth()->user()->can('global access')) {
            abort(403);
        }

        $conversation->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        // broadcast(new ConversationUpdated($conversation->fresh()))->toOthers();

        return back()->with('success', 'Conversation closed');
    }

    public function reopen(ChatConversation $conversation)
    {
        $user = auth()->user();

        if ($user) {
            if (!$user->can('chat access') && !$user->can('global access')) {
                abort(403);
            }

            if ($user->hasRole('customer') && $conversation->customer_id !== $user->id) {
                abort(403);
            }
        } else {
            if ($conversation->guest_session_id !== session('guest_chat_session_id')) {
                abort(403);
            }
        }

        $conversation->update([
            'status' => $conversation->staff_id ? 'assigned' : 'open',
            'closed_at' => null,
        ]);

        // broadcast(new ConversationUpdated($conversation->fresh()))->toOthers();

        return back()->with('success', 'Conversation reopened');
    }

    private function getOrCreateGuestSession(): string
    {
        $sessionId = session('guest_chat_session_id');

        if (!$sessionId) {
            $sessionId = Str::uuid()->toString();
            session(['guest_chat_session_id' => $sessionId]);
        }

        return $sessionId;
    }
}
