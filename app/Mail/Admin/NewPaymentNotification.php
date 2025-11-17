<?php

namespace App\Mail\Admin;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewPaymentNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Payment $payment
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[New Payment] ' . $this->payment->payment_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.admin.new-payment',
        );
    }
}
