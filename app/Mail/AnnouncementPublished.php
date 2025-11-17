<?php

namespace App\Mail;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AnnouncementPublished extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Announcement $announcement
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Announcement: ' . $this->announcement->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.announcements.published',
        );
    }
}
