<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\Booking;
use App\Http\Requests\Feedback\StoreFeedbackRequest;
use App\Http\Requests\Feedback\UpdateFeedbackRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:feedback show|global access')->only(['index', 'show']);
        $this->middleware('permission:feedback create|global access')->only(['create', 'store']);
        $this->middleware('permission:feedback edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:feedback delete|global access')->only('destroy');
        $this->middleware('permission:feedback approve|global access')->only(['approve', 'reject']);
    }

    public function index(): Response
    {
        $feedbacks = Feedback::with(['booking.accommodations.accommodation'])
            ->latest()
            ->paginate(10);

        return Inertia::render('feedback/index', [
            'feedbacks' => $feedbacks,
        ]);
    }

    public function create(): Response
    {
        $bookings = Booking::whereIn('status', ['checked_out'])
            ->orderBy('booking_number', 'desc')
            ->get();

        return Inertia::render('feedback/create', [
            'bookings' => $bookings,
        ]);
    }

    public function store(StoreFeedbackRequest $request): RedirectResponse
    {
        Feedback::create($request->validated());

        return redirect()->route('feedbacks.index')
            ->with('success', 'Feedback submitted successfully.');
    }

    public function show(Feedback $feedback): Response
    {
        $feedback->load(['booking.accommodations.accommodation']);

        return Inertia::render('feedback/show', [
            'feedback' => $feedback,
        ]);
    }

    public function edit(Feedback $feedback): Response
    {
        $bookings = Booking::whereIn('status', ['checked_out'])
            ->orderBy('booking_number', 'desc')
            ->get();

        return Inertia::render('feedback/edit', [
            'feedback' => $feedback,
            'bookings' => $bookings,
        ]);
    }

    public function update(UpdateFeedbackRequest $request, Feedback $feedback): RedirectResponse
    {
        $feedback->update($request->validated());

        return redirect()->route('feedbacks.show', $feedback)
            ->with('success', 'Feedback updated successfully.');
    }

    public function destroy(Feedback $feedback): RedirectResponse
    {
        $feedback->delete();

        return redirect()->route('feedbacks.index')
            ->with('success', 'Feedback deleted successfully.');
    }

    public function approve(Feedback $feedback): RedirectResponse
    {
        $feedback->update(['status' => 'approved']);

        return back()->with('success', 'Feedback approved successfully.');
    }

    public function reject(Feedback $feedback): RedirectResponse
    {
        $feedback->update(['status' => 'rejected']);

        return back()->with('success', 'Feedback rejected successfully.');
    }
}
