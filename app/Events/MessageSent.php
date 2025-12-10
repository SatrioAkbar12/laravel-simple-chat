<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chatMessage;

    public function __construct(ChatMessage $chatMessage)
    {
        $this->chatMessage = $chatMessage;
    }

    public function broadcastOn(): array
    {
        // Broadcast on a public channel for simplicity
        return [
            new PrivateChannel('chat'),
        ];
    }

    // Optional: Specify what data to broadcast
    public function broadcastWith(): array
    {
        return [
            'id' => $this->chatMessage->id,
            'message' => $this->chatMessage->message,
            'user_name' => $this->chatMessage->user->name,
            'created_at' => $this->chatMessage->created_at->diffForHumans(),
        ];
    }
}
