<?php

namespace App\Events;

use App\Models\ChatConversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ChatConversation $conversation)
    {
        $this->conversation->load(['customer', 'staff', 'latestMessage']);
    }

    public function broadcastOn(): array
    {
        $channels = [new Channel('conversations')];

        if ($this->conversation->customer_id) {
            $channels[] = new Channel('conversations.customer.' . $this->conversation->customer_id);
        }

        if ($this->conversation->staff_id) {
            $channels[] = new Channel('conversations.staff.' . $this->conversation->staff_id);
        }

        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'conversation' => $this->conversation->toArray(),
        ];
    }
}
