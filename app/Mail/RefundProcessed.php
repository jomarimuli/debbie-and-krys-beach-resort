<?php

namespace App\Mail;

use App\Models\Refund;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RefundProcessed extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Refund $refund
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Refund Processed - ' . $this->refund->refund_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.refunds.processed',
        );
    }
}
