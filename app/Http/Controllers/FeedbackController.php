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
        $query = Feedback::with(['booking.accommodations.accommodation']);

        // Customers can only see their own feedback
        if (auth()->user()->hasRole('customer')) {
            $query->whereHas('booking', function ($q) {
                $q->where('created_by', auth()->id());
            });
        }

        $feedbacks = $query->latest()->paginate(10);

        return Inertia::render('feedback/index', [
            'feedbacks' => $feedbacks,
        ]);
    }

    public function create(): Response
    {
        $query = Booking::whereIn('status', ['checked_out']);

        // Customers can only create feedback for their own bookings
        if (auth()->user()->hasRole('customer')) {
            $query->where('created_by', auth()->id());
        }

        $bookings = $query->orderBy('booking_number', 'desc')->get();

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
        // Customers can only view their own feedback
        if (auth()->user()->hasRole('customer') && $feedback->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $feedback->load(['booking.accommodations.accommodation']);

        return Inertia::render('feedback/show', [
            'feedback' => $feedback,
        ]);
    }

    public function edit(Feedback $feedback): Response
    {
        // Customers can only edit their own feedback
        if (auth()->user()->hasRole('customer') && $feedback->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $query = Booking::whereIn('status', ['checked_out']);

        if (auth()->user()->hasRole('customer')) {
            $query->where('created_by', auth()->id());
        }

        $bookings = $query->orderBy('booking_number', 'desc')->get();

        return Inertia::render('feedback/edit', [
            'feedback' => $feedback,
            'bookings' => $bookings,
        ]);
    }

    public function update(UpdateFeedbackRequest $request, Feedback $feedback): RedirectResponse
    {
        // Customers can only update their own feedback
        if (auth()->user()->hasRole('customer') && $feedback->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $feedback->update($request->validated());

        return redirect()->route('feedbacks.show', $feedback)
            ->with('success', 'Feedback updated successfully.');
    }

    public function destroy(Feedback $feedback): RedirectResponse
    {
        // Customers can only delete their own feedback
        if (auth()->user()->hasRole('customer') && $feedback->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $feedback->delete();

        return redirect()->route('feedbacks.index')
            ->with('success', 'Feedback deleted successfully.');
    }

    // Customers cannot approve/reject feedback
    public function approve(Feedback $feedback): RedirectResponse
    {
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        $feedback->update(['status' => 'approved']);

        return back()->with('success', 'Feedback approved successfully.');
    }

    public function reject(Feedback $feedback): RedirectResponse
    {
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        $feedback->update(['status' => 'rejected']);

        return back()->with('success', 'Feedback rejected successfully.');
    }
}
