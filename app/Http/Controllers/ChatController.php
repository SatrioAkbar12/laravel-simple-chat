<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index() {
         $chats = ChatMessage::with('user:id,name')->get()->map(function ($chat) {
            return [
                'id' => $chat->id,
                'message' => $chat->message,
                'user_name' => $chat->user->name,
                'created_at' => $chat->created_at->diffForHumans(),
            ];
        });

        return Inertia::render('Chat/Index', [
            'chats' => $chats,
        ]);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'message' => 'required|string|',
        ]);

        $chatMessage = $request->user()->chatMessages()->create($validated);

        MessageSent::dispatch($chatMessage);
        logger('Broadcast ke private-chat');

        return redirect()->back();
    }
}
