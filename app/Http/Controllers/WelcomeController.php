<?php

namespace App\Http\Controllers;

use App\Models\Gallery;
use App\Models\Feedback;
use App\Models\Announcement;
use App\Models\Accommodation;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function index(): Response
    {
        $latestAnnouncement = Announcement::current()
            ->latest('published_at')
            ->latest('created_at')
            ->first();

        $galleries = Gallery::active()
            ->ordered()
            ->get();

        $accommodations = Accommodation::with(['rates'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $feedbacks = Feedback::with(['booking.accommodations.accommodation'])
            ->approved()
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('welcome', [
            'latestAnnouncement' => $latestAnnouncement,
            'galleries' => $galleries,
            'accommodations' => $accommodations,
            'feedbacks' => $feedbacks,
        ]);
    }
}
