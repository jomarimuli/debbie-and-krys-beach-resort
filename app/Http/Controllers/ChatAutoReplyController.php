<?php

namespace App\Http\Controllers;

use App\Models\ChatAutoReply;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatAutoReplyController extends Controller
{
    public function index()
    {
        if (!auth()->user()->can('chat access') && !auth()->user()->can('global access')) {
            abort(403);
        }

        $autoReplies = ChatAutoReply::orderBy('trigger_type')->get();

        return Inertia::render('chat/auto-replies', [
            'autoReplies' => $autoReplies,
        ]);
    }

    public function update(Request $request, ChatAutoReply $autoReply)
    {
        if (!auth()->user()->can('chat access') && !auth()->user()->can('global access')) {
            abort(403);
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'is_active' => ['boolean'],
            'delay_seconds' => ['integer', 'min:0', 'max:60'],
        ]);

        $autoReply->update($validated);

        return back()->with('success', 'Auto-reply updated successfully');
    }
}
