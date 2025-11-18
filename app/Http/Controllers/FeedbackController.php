<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use App\Models\Booking;
use App\Http\Requests\Feedback\StoreFeedbackRequest;
use App\Http\Requests\Feedback\UpdateFeedbackRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Mail;
use App\Services\NotificationService;
use App\Mail\FeedbackApproved;
use App\Mail\Admin\NewFeedbackNotification;
use Illuminate\Support\Facades\Log;

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
        $query = Booking::whereIn('status', ['checked_out'])
            ->whereDoesntHave('feedback');

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
        $validated = $request->validated();

        if (auth()->user()->hasRole('customer')) {
            $validated['status'] = 'pending';
        }

        $feedback = Feedback::create($validated);

        $feedback->load('booking');

        try {
            $adminEmails = NotificationService::getAdminStaffEmails();
            if (!empty($adminEmails)) {
                Mail::to($adminEmails)->send(new NewFeedbackNotification($feedback));
            }
        } catch (\Exception $e) {
            Log::error('Feedback notification email failed: ' . $e->getMessage());
        }

        return redirect()->route('feedbacks.index')
            ->with('success', 'Feedback submitted successfully.');
    }

    public function show(Feedback $feedback): Response
    {
        if (auth()->user()->hasRole('customer') && $feedback->booking && $feedback->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $feedback->load(['booking.accommodations.accommodation']);

        return Inertia::render('feedback/show', [
            'feedback' => $feedback,
        ]);
    }

    public function edit(Feedback $feedback): Response
    {
        if (auth()->user()->hasRole('customer') && $feedback->booking && $feedback->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $query = Booking::whereIn('status', ['checked_out'])
            ->where(function ($q) use ($feedback) {
                $q->whereDoesntHave('feedback')
                    ->orWhere('id', $feedback->booking_id);
            });

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
        if (auth()->user()->hasRole('customer') && $feedback->booking && $feedback->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validated();

        if (auth()->user()->hasRole('customer')) {
            $validated['status'] = 'pending';
        }

        $feedback->update($validated);

        return redirect()->route('feedbacks.show', $feedback)
            ->with('success', 'Feedback updated successfully.');
    }

    public function destroy(Feedback $feedback): RedirectResponse
    {
        if (auth()->user()->hasRole('customer') && $feedback->booking && $feedback->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $feedback->delete();

        return redirect()->route('feedbacks.index')
            ->with('success', 'Feedback deleted successfully.');
    }

    public function approve(Feedback $feedback): RedirectResponse
    {
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        $feedback->update(['status' => 'approved']);

        $feedback->load('booking');

        try {
            if ($feedback->booking && $feedback->booking->guest_email) {
                Mail::to($feedback->booking->guest_email)->send(new FeedbackApproved($feedback));
            }
        } catch (\Exception $e) {
            Log::error('Feedback approval email failed: ' . $e->getMessage());
        }

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
