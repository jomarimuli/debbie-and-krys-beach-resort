<?php

namespace App\Mail;

use App\Models\Rebooking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RebookingCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Rebooking $rebooking
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Rebooking Request Submitted - ' . $this->rebooking->rebooking_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.rebookings.created',
        );
    }
}
