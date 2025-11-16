<?php

namespace App\Mail;

use App\Models\Rebooking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RebookingCancelled extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Rebooking $rebooking
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Rebooking Cancelled - ' . $this->rebooking->rebooking_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.rebookings.cancelled',
        );
    }
}
