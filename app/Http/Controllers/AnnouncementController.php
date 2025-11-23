<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Http\Requests\Announcement\StoreAnnouncementRequest;
use App\Http\Requests\Announcement\UpdateAnnouncementRequest;
use App\Mail\AnnouncementPublished;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:announcement show|global access')->only(['index', 'show']);
        $this->middleware('permission:announcement create|global access')->only(['create', 'store']);
        $this->middleware('permission:announcement edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:announcement delete|global access')->only('destroy');
    }

    public function index(): Response
    {
        $announcements = Announcement::latest('published_at')
            ->latest('created_at')
            ->paginate(100);

        return Inertia::render('announcement/index', [
            'announcements' => $announcements,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('announcement/create');
    }

    public function store(StoreAnnouncementRequest $request): RedirectResponse
    {
        $announcement = Announcement::create($request->validated());

        // Send email notification if announcement is published
        if ($announcement->published_at) {
            $this->sendAnnouncementEmail($announcement);
        }

        return redirect()->route('announcements.index')
            ->with('success', 'Announcement created successfully.' .
                ($announcement->published_at ? ' Email notifications sent to all active users.' : ''));
    }

    public function show(Announcement $announcement): Response
    {
        return Inertia::render('announcement/show', [
            'announcement' => $announcement,
        ]);
    }

    public function edit(Announcement $announcement): Response
    {
        return Inertia::render('announcement/edit', [
            'announcement' => $announcement,
        ]);
    }

    public function update(UpdateAnnouncementRequest $request, Announcement $announcement): RedirectResponse
    {
        $wasPublished = $announcement->published_at !== null;
        $announcement->update($request->validated());
        $isNowPublished = $announcement->published_at !== null;

        // Send email if announcement is newly published
        if (!$wasPublished && $isNowPublished) {
            $this->sendAnnouncementEmail($announcement);
        }

        return redirect()->route('announcements.show', $announcement)
            ->with('success', 'Announcement updated successfully.' .
                (!$wasPublished && $isNowPublished ? ' Email notifications sent to all active users.' : ''));
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->route('announcements.index')
            ->with('success', 'Announcement deleted successfully.');
    }

    /**
     * Send announcement email to all active users
     */
    protected function sendAnnouncementEmail(Announcement $announcement): void
    {
        try {
            $recipients = NotificationService::getAllActiveUserEmails();

            if (empty($recipients)) {
                Log::warning('No active users found to send announcement email.');
                return;
            }

            // Send in batches to avoid overwhelming the mail server
            $totalSent = NotificationService::sendInBatches(
                $recipients,
                new AnnouncementPublished($announcement),
                50 // Batch size: 50 emails at a time
            );
        } catch (\Exception $e) {
            Log::error('Announcement email failed: ' . $e->getMessage());
        }
    }
}
