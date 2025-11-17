<?php

namespace App\Mail\Admin;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewBookingNotification extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[New Booking] ' . $this->booking->booking_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.admin.new-booking',
        );
    }
}
