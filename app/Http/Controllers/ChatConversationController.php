<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

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

        if ($user) {
            $isCustomer = $user->hasRole('customer');
            if ($isCustomer) {
                // Customers only see their own conversations
                $query->forCustomer($user->id);
            } else {
                // Staff see all conversations (not just assigned to them)
                // No filter needed - they see everything
            }
        }

        $conversations = $query->latest('updated_at')->get();

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
        ]);
    }

    public function store(Request $request)
    {
        // Check permissions for authenticated users
        if (auth()->check() && !auth()->user()->can('chat access') && !auth()->user()->can('global access')) {
            abort(403);
        }

        // Different validation rules for authenticated vs guest users
        if (auth()->check()) {
            $validated = $request->validate([
                'subject' => ['nullable', 'string', 'max:255'],
                'message' => ['required', 'string', 'max:1000'],
            ]);
        } else {
            $validated = $request->validate([
                'subject' => ['nullable', 'string', 'max:255'],
                'message' => ['required', 'string', 'max:1000'],
                'guest_name' => ['required', 'string', 'max:255'],
                'guest_email' => ['required', 'email', 'max:255'],
            ]);
        }

        // Only set guest session for non-authenticated users
        $guestSessionId = null;
        if (!auth()->check()) {
            $guestSessionId = session('guest_chat_session_id');
            if (!$guestSessionId) {
                $guestSessionId = Str::uuid()->toString();
                session(['guest_chat_session_id' => $guestSessionId]);
            }
        }

        // Create conversation with correct data based on auth status
        $conversationData = [
            'subject' => $validated['subject'] ?? null,
            'status' => 'open',
        ];

        if (auth()->check()) {
            // Authenticated user
            $conversationData['customer_id'] = auth()->id();
            $conversationData['guest_session_id'] = null;
            $conversationData['guest_name'] = null;
            $conversationData['guest_email'] = null;
        } else {
            // Guest user
            $conversationData['customer_id'] = null;
            $conversationData['guest_session_id'] = $guestSessionId;
            $conversationData['guest_name'] = $validated['guest_name'];
            $conversationData['guest_email'] = $validated['guest_email'];
        }

        $conversation = ChatConversation::create($conversationData);

        ChatMessage::create([
            'conversation_id' => $conversation->id,
            'sender_id' => auth()->id(), // Will be null for guests
            'sender_name' => auth()->check() ? null : $validated['guest_name'],
            'message' => $validated['message'],
        ]);

        return redirect()->route('chat.show', $conversation->id)
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
        }

        $conversation->load(['customer', 'staff', 'messages.sender']);

        if ($user) {
            $conversation->messages()
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
                ->each(fn($message) => $message->markAsRead());
        }

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
        }

        $conversation->update([
            'status' => $conversation->staff_id ? 'assigned' : 'open',
            'closed_at' => null,
        ]);

        return back()->with('success', 'Conversation reopened');
    }
}
