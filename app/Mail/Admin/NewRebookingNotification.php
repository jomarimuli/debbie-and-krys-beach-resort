<?php

namespace App\Mail\Admin;

use App\Models\Rebooking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewRebookingNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Rebooking $rebooking
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[New Rebooking Request] ' . $this->rebooking->rebooking_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.admin.new-rebooking',
        );
    }
}
