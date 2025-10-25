<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Http\Requests\Announcement\StoreAnnouncementRequest;
use App\Http\Requests\Announcement\UpdateAnnouncementRequest;
use Illuminate\Http\RedirectResponse;
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
            ->paginate(10);

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
        Announcement::create($request->validated());

        return redirect()->route('announcements.index')
            ->with('success', 'Announcement created successfully.');
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
        $announcement->update($request->validated());

        return redirect()->route('announcements.show', $announcement)
            ->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();

        return redirect()->route('announcements.index')
            ->with('success', 'Announcement deleted successfully.');
    }
}
