<?php

namespace Database\Seeders;

use App\Models\ChatAutoReply;
use Illuminate\Database\Seeder;

class ChatAutoReplySeeder extends Seeder
{
    public function run(): void
    {
        ChatAutoReply::create([
            'trigger_type' => 'new_conversation',
            'message' => "Thank you for contacting us! \n\nA member of our team will be with you shortly. In the meantime, feel free to provide as much detail as possible about your inquiry.\n\nOur typical response time is within 5-10 minutes during business hours.",
            'is_active' => true,
            'delay_seconds' => 1,
        ]);
    }
}
