<?php

namespace App\Mail\Admin;

use App\Models\Feedback;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewFeedbackNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Feedback $feedback
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[New Feedback] Rating: ' . $this->feedback->rating . '/5',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.admin.new-feedback',
        );
    }
}
