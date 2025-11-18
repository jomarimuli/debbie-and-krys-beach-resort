<?php

namespace App\Http\Controllers;

use App\Models\Rebooking;
use App\Models\Booking;
use App\Models\Accommodation;
use App\Models\AccommodationRate;
use App\Models\RebookingAccommodation;
use App\Models\RebookingEntranceFee;
use App\Http\Requests\Rebooking\StoreRebookingRequest;
use App\Http\Requests\Rebooking\UpdateRebookingRequest;
use App\Http\Requests\Rebooking\ApproveRebookingRequest;
use App\Http\Requests\Rebooking\RejectRebookingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Mail;
use App\Services\NotificationService;
use App\Mail\RebookingCreated;
use App\Mail\RebookingApproved;
use App\Mail\RebookingCompleted;
use App\Mail\RebookingCancelled;
use App\Mail\Admin\NewRebookingNotification;

class RebookingController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:booking show|global access')->only(['index', 'show']);
        $this->middleware('permission:booking edit|global access')->only(['create', 'store', 'edit', 'update', 'approve', 'reject', 'cancel']);
        $this->middleware('permission:booking delete|global access')->only('destroy');
    }

    public function index(): Response
    {
        $query = Rebooking::with([
            'originalBooking',
            'processedByUser',
            'accommodations.accommodation',
        ]);

        // Customers can only see rebookings for their own bookings
        if (auth()->user()->hasRole('customer')) {
            $query->whereHas('originalBooking', function ($q) {
                $q->where('created_by', auth()->id());
            });
        }

        $rebookings = $query->latest()->paginate(10);

        return Inertia::render('rebooking/index', [
            'rebookings' => $rebookings,
        ]);
    }

    public function create(Booking $booking): Response|RedirectResponse
    {
        if (auth()->user()->hasRole('customer') && $booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Check if booking can be rebooked
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return redirect()->route('bookings.show', $booking)
                ->with('error', "Only pending or confirmed bookings can be rebooked. Current status: {$booking->status}");
        }

        if ($booking->check_in_date <= now()->toDateString()) {
            return redirect()->route('bookings.show', $booking)
                ->with('error', 'Cannot rebook a past or current booking.');
        }

        // Check for existing pending rebooking
        $existingRebooking = $booking->rebookings()
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingRebooking) {
            return redirect()->route('bookings.show', $booking)
                ->with('error', "This booking already has a {$existingRebooking->status} rebooking request ({$existingRebooking->rebooking_number}). Please complete or cancel it first.");
        }

        $booking->load([
            'accommodations.accommodation',
            'accommodations.accommodationRate',
            'entranceFees',
        ]);

        $accommodations = Accommodation::with('rates')->active()->orderBy('name')->get();

        // Calculate minimum date: greater of (tomorrow or original check-in date)
        $tomorrow = now()->addDay()->format('Y-m-d');
        $originalCheckIn = $booking->check_in_date->format('Y-m-d');
        $minDate = $tomorrow > $originalCheckIn ? $tomorrow : $originalCheckIn;

        return Inertia::render('rebooking/create', [
            'booking' => $booking,
            'accommodations' => $accommodations,
            'minRebookDate' => $minDate,
        ]);
    }

    public function store(StoreRebookingRequest $request): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $originalBooking = Booking::with(['accommodations', 'entranceFees'])->findOrFail($request->original_booking_id);

            // Calculate number of nights for overnight bookings
            $numberOfNights = 1;
            if ($originalBooking->booking_type === 'overnight' && $request->new_check_out_date) {
                $checkIn = \Carbon\Carbon::parse($request->new_check_in_date);
                $checkOut = \Carbon\Carbon::parse($request->new_check_out_date);
                $numberOfNights = max(1, $checkOut->diffInDays($checkIn));
            }

            // Calculate new booking totals
            $accommodationTotal = 0;
            $entranceFeeTotal = 0;
            $totalFreeEntrances = 0;

            $accommodationsData = [];

            foreach ($request->accommodations as $index => $item) {
                $accommodation = Accommodation::findOrFail($item['accommodation_id']);
                $rate = AccommodationRate::findOrFail($item['accommodation_rate_id']);

                // Calculate base rate (multiply by nights for overnight)
                $baseRate = $rate->rate;
                if ($originalBooking->booking_type === 'overnight') {
                    $baseRate = $rate->rate * $numberOfNights;
                }

                $subtotal = $baseRate;
                $additionalPaxCharge = 0;

                if ($accommodation->min_capacity && $item['guests'] > $accommodation->min_capacity) {
                    $additionalGuests = $item['guests'] - $accommodation->min_capacity;
                    $additionalPaxRate = $rate->additional_pax_rate ?? 0;

                    // Multiply additional pax rate by nights for overnight
                    if ($originalBooking->booking_type === 'overnight') {
                        $additionalPaxRate = $additionalPaxRate * $numberOfNights;
                    }

                    $additionalPaxCharge = $additionalGuests * $additionalPaxRate;
                    $subtotal += $additionalPaxCharge;
                }

                $freeEntranceUsed = $rate->includes_free_entrance
                    ? min($item['guests'], $accommodation->min_capacity ?? 0)
                    : 0;

                $accommodationsData[] = [
                    'accommodation_id' => $accommodation->id,
                    'accommodation_rate_id' => $rate->id,
                    'guests' => $item['guests'],
                    'rate' => $rate->rate,
                    'additional_pax_charge' => $additionalPaxCharge,
                    'subtotal' => $subtotal,
                    'free_entrance_used' => $freeEntranceUsed,
                ];

                $accommodationTotal += $subtotal;

                if ($rate->includes_free_entrance) {
                    $totalFreeEntrances += $freeEntranceUsed;
                }
            }

            // Calculate entrance fees (not multiplied by nights)
            $adultsNeedingEntrance = max(0, $request->new_total_adults - $totalFreeEntrances);
            $childrenNeedingEntrance = $request->new_total_children;

            $firstSelectedRate = AccommodationRate::find($request->accommodations[0]['accommodation_rate_id']);

            $entranceFeesData = [];

            if ($adultsNeedingEntrance > 0 && $firstSelectedRate?->adult_entrance_fee) {
                $adultFee = $adultsNeedingEntrance * $firstSelectedRate->adult_entrance_fee;
                $entranceFeesData[] = [
                    'type' => 'adult',
                    'quantity' => $adultsNeedingEntrance,
                    'rate' => $firstSelectedRate->adult_entrance_fee,
                    'subtotal' => $adultFee,
                ];
                $entranceFeeTotal += $adultFee;
            }

            if ($childrenNeedingEntrance > 0 && $firstSelectedRate?->child_entrance_fee) {
                $childFee = $childrenNeedingEntrance * $firstSelectedRate->child_entrance_fee;
                $entranceFeesData[] = [
                    'type' => 'child',
                    'quantity' => $childrenNeedingEntrance,
                    'rate' => $firstSelectedRate->child_entrance_fee,
                    'subtotal' => $childFee,
                ];
                $entranceFeeTotal += $childFee;
            }

            $newAmount = $accommodationTotal + $entranceFeeTotal;
            $amountDifference = $newAmount - $originalBooking->total_amount;

            // Create rebooking
            $rebooking = Rebooking::create([
                'original_booking_id' => $originalBooking->id,
                'processed_by' => auth()->id(),
                'new_check_in_date' => $request->new_check_in_date,
                'new_check_out_date' => $request->new_check_out_date,
                'new_total_adults' => $request->new_total_adults,
                'new_total_children' => $request->new_total_children,
                'original_amount' => $originalBooking->total_amount,
                'new_amount' => $newAmount,
                'amount_difference' => $amountDifference,
                'rebooking_fee' => 0,
                'total_adjustment' => $amountDifference,
                'status' => 'pending',
                'payment_status' => 'pending',
                'reason' => $request->reason,
            ]);

            // Create rebooking accommodations
            foreach ($accommodationsData as $accomData) {
                RebookingAccommodation::create([
                    'rebooking_id' => $rebooking->id,
                    ...$accomData,
                ]);
            }

            // Create rebooking entrance fees
            foreach ($entranceFeesData as $feeData) {
                RebookingEntranceFee::create([
                    'rebooking_id' => $rebooking->id,
                    ...$feeData,
                ]);
            }

            // Load relationships for emails
            $rebooking->load(['originalBooking', 'accommodations.accommodation', 'processedByUser']);

            DB::commit();

            // Send email notifications
            try {
                // Send to customer
                if ($originalBooking->guest_email) {
                    Mail::to($originalBooking->guest_email)->send(new RebookingCreated($rebooking));
                }

                // Send to admin/staff
                $adminEmails = NotificationService::getAdminStaffEmails();
                if (!empty($adminEmails)) {
                    Mail::to($adminEmails)->send(new NewRebookingNotification($rebooking));
                }
            } catch (\Exception $e) {
                Log::error('Rebooking email failed: ' . $e->getMessage());
            }

            return redirect()->route('rebookings.show', $rebooking)
                ->with('success', 'Rebooking request created successfully. Rebooking number: ' . $rebooking->rebooking_number);
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Rebooking $rebooking): Response
    {
        // Check if customer is trying to view someone else's rebooking
        if (auth()->user()->hasRole('customer') && $rebooking->originalBooking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $rebooking->load([
            'originalBooking.accommodations.accommodation',
            'originalBooking.accommodations.accommodationRate',
            'originalBooking.entranceFees',
            'accommodations.accommodation',
            'accommodations.accommodationRate',
            'entranceFees',
            'processedByUser',
            'payments',
            'refunds',
        ]);

        return Inertia::render('rebooking/show', [
            'rebooking' => $rebooking,
        ]);
    }

    public function edit(Rebooking $rebooking): Response|RedirectResponse
    {
        // Check if customer is trying to edit someone else's rebooking
        if (auth()->user()->hasRole('customer') && $rebooking->originalBooking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        if ($rebooking->status !== 'pending') {
            return redirect()->route('rebookings.show', $rebooking)
                ->with('error', 'Only pending rebookings can be edited.');
        }

        $rebooking->load([
            'originalBooking',
            'accommodations.accommodation',
            'accommodations.accommodationRate',
        ]);

        $accommodations = Accommodation::with('rates')->active()->orderBy('name')->get();

        return Inertia::render('rebooking/edit', [
            'rebooking' => $rebooking,
            'accommodations' => $accommodations,
        ]);
    }

    public function update(UpdateRebookingRequest $request, Rebooking $rebooking): RedirectResponse
    {
        DB::beginTransaction();
        try {
            // Recalculate totals similar to store method
            $accommodationTotal = 0;
            $entranceFeeTotal = 0;
            $totalFreeEntrances = 0;

            // Delete existing accommodations and entrance fees
            $rebooking->accommodations()->delete();
            $rebooking->entranceFees()->delete();

            foreach ($request->accommodations as $item) {
                $accommodation = Accommodation::findOrFail($item['accommodation_id']);
                $rate = AccommodationRate::findOrFail($item['accommodation_rate_id']);

                $subtotal = $rate->rate;
                $additionalPaxCharge = 0;

                if ($accommodation->min_capacity && $item['guests'] > $accommodation->min_capacity) {
                    $additionalGuests = $item['guests'] - $accommodation->min_capacity;
                    $additionalPaxCharge = $additionalGuests * ($rate->additional_pax_rate ?? 0);
                    $subtotal += $additionalPaxCharge;
                }

                $freeEntranceUsed = $rate->includes_free_entrance
                    ? min($item['guests'], $accommodation->min_capacity ?? 0)
                    : 0;

                RebookingAccommodation::create([
                    'rebooking_id' => $rebooking->id,
                    'accommodation_id' => $accommodation->id,
                    'accommodation_rate_id' => $rate->id,
                    'guests' => $item['guests'],
                    'rate' => $rate->rate,
                    'additional_pax_charge' => $additionalPaxCharge,
                    'subtotal' => $subtotal,
                    'free_entrance_used' => $freeEntranceUsed,
                ]);

                $accommodationTotal += $subtotal;

                if ($rate->includes_free_entrance) {
                    $totalFreeEntrances += $freeEntranceUsed;
                }
            }

            // Calculate entrance fees
            $adultsNeedingEntrance = max(0, $request->new_total_adults - $totalFreeEntrances);
            $childrenNeedingEntrance = $request->new_total_children;

            $firstSelectedRate = AccommodationRate::find($request->accommodations[0]['accommodation_rate_id']);

            if ($adultsNeedingEntrance > 0 && $firstSelectedRate?->adult_entrance_fee) {
                $adultFee = $adultsNeedingEntrance * $firstSelectedRate->adult_entrance_fee;
                RebookingEntranceFee::create([
                    'rebooking_id' => $rebooking->id,
                    'type' => 'adult',
                    'quantity' => $adultsNeedingEntrance,
                    'rate' => $firstSelectedRate->adult_entrance_fee,
                    'subtotal' => $adultFee,
                ]);
                $entranceFeeTotal += $adultFee;
            }

            if ($childrenNeedingEntrance > 0 && $firstSelectedRate?->child_entrance_fee) {
                $childFee = $childrenNeedingEntrance * $firstSelectedRate->child_entrance_fee;
                RebookingEntranceFee::create([
                    'rebooking_id' => $rebooking->id,
                    'type' => 'child',
                    'quantity' => $childrenNeedingEntrance,
                    'rate' => $firstSelectedRate->child_entrance_fee,
                    'subtotal' => $childFee,
                ]);
                $entranceFeeTotal += $childFee;
            }

            $newAmount = $accommodationTotal + $entranceFeeTotal;
            $amountDifference = $newAmount - $rebooking->original_amount;

            // Update rebooking
            $rebooking->update([
                'new_check_in_date' => $request->new_check_in_date,
                'new_check_out_date' => $request->new_check_out_date,
                'new_total_adults' => $request->new_total_adults,
                'new_total_children' => $request->new_total_children,
                'new_amount' => $newAmount,
                'amount_difference' => $amountDifference,
                'total_adjustment' => $amountDifference + $rebooking->rebooking_fee,
                'reason' => $request->reason,
            ]);

            DB::commit();

            return redirect()->route('rebookings.show', $rebooking)
                ->with('success', 'Rebooking request updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function approve(ApproveRebookingRequest $request, Rebooking $rebooking): RedirectResponse
    {
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        if ($rebooking->status !== 'pending') {
            return back()->with('error', 'Only pending rebookings can be approved.');
        }

        DB::beginTransaction();
        try {
            $rebookingFee = $request->rebooking_fee ?? 0;
            $totalAdjustment = $rebooking->amount_difference + $rebookingFee;

            $rebooking->update([
                'status' => 'approved',
                'rebooking_fee' => $rebookingFee,
                'total_adjustment' => $totalAdjustment,
                'admin_notes' => $request->admin_notes,
                'approved_at' => now(),
            ]);

            $rebooking->load('originalBooking');

            DB::commit();

            try {
                if ($rebooking->originalBooking->guest_email) {
                    Mail::to($rebooking->originalBooking->guest_email)->send(new RebookingApproved($rebooking));
                }
            } catch (\Exception $e) {
                Log::error('Rebooking approval email failed: ' . $e->getMessage());
            }

            return back()->with('success', 'Rebooking request approved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function reject(RejectRebookingRequest $request, Rebooking $rebooking): RedirectResponse
    {
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        if ($rebooking->status !== 'pending') {
            return back()->with('error', 'Only pending rebookings can be rejected.');
        }

        $rebooking->update([
            'status' => 'cancelled',
            'admin_notes' => $request->admin_notes,
        ]);

        return back()->with('success', 'Rebooking request rejected.');
    }

    public function cancel(Rebooking $rebooking): RedirectResponse
    {
        if (!in_array($rebooking->status, ['pending', 'approved'])) {
            return back()->with('error', 'Only pending or approved rebookings can be cancelled.');
        }

        $rebooking->update(['status' => 'cancelled']);

        // Load relationships for email
        $rebooking->load('originalBooking');

        // Send email notification
        try {
            if ($rebooking->originalBooking->guest_email) {
                Mail::to($rebooking->originalBooking->guest_email)->send(new RebookingCancelled($rebooking));
            }
        } catch (\Exception $e) {
            Log::error('Rebooking cancellation email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Rebooking request cancelled.');
    }

    public function complete(Rebooking $rebooking): RedirectResponse
    {
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        if ($rebooking->status !== 'approved') {
            return back()->with('error', 'Only approved rebookings can be completed.');
        }

        // Check if payment/refund is complete
        if (!$rebooking->isPaymentComplete()) {
            $totalAdjustment = (float)$rebooking->total_adjustment;

            if ($totalAdjustment > 0) {
                return back()->with('error', 'Cannot complete rebooking. Payment of ₱' . number_format($rebooking->remaining_payment, 2) . ' is still required.');
            } else {
                return back()->with('error', 'Cannot complete rebooking. Refund of ₱' . number_format($rebooking->remaining_refund, 2) . ' is still required.');
            }
        }

        DB::beginTransaction();
        try {
            $originalBooking = $rebooking->originalBooking;

            $originalBooking->update([
                'check_in_date' => $rebooking->new_check_in_date,
                'check_out_date' => $rebooking->new_check_out_date,
                'total_adults' => $rebooking->new_total_adults,
                'total_children' => $rebooking->new_total_children,
                'accommodation_total' => $rebooking->accommodations->sum('subtotal'),
                'entrance_fee_total' => $rebooking->entranceFees->sum('subtotal'),
                'total_amount' => $rebooking->new_amount,
            ]);

            $originalBooking->accommodations()->delete();
            $originalBooking->entranceFees()->delete();

            foreach ($rebooking->accommodations as $rebookingAccom) {
                $originalBooking->accommodations()->create([
                    'accommodation_id' => $rebookingAccom->accommodation_id,
                    'accommodation_rate_id' => $rebookingAccom->accommodation_rate_id,
                    'guests' => $rebookingAccom->guests,
                    'rate' => $rebookingAccom->rate,
                    'additional_pax_charge' => $rebookingAccom->additional_pax_charge,
                    'subtotal' => $rebookingAccom->subtotal,
                    'free_entrance_used' => $rebookingAccom->free_entrance_used,
                ]);
            }

            foreach ($rebooking->entranceFees as $rebookingFee) {
                $originalBooking->entranceFees()->create([
                    'type' => $rebookingFee->type,
                    'quantity' => $rebookingFee->quantity,
                    'rate' => $rebookingFee->rate,
                    'subtotal' => $rebookingFee->subtotal,
                ]);
            }

            // Update booking's paid amount to reflect new total
            $originalBooking->updatePaidAmount();

            $rebooking->update([
                'status' => 'completed',
                'payment_status' => 'paid', // or 'refunded' depending on adjustment
                'completed_at' => now(),
            ]);

            $rebooking->load('originalBooking');

            DB::commit();

            try {
                if ($rebooking->originalBooking->guest_email) {
                    Mail::to($rebooking->originalBooking->guest_email)->send(new RebookingCompleted($rebooking));
                }
            } catch (\Exception $e) {
                Log::error('Rebooking completion email failed: ' . $e->getMessage());
            }

            return redirect()->route('rebookings.show', $rebooking)
                ->with('success', 'Rebooking completed successfully. Original booking has been updated.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to complete rebooking: ' . $e->getMessage());
        }
    }

    public function destroy(Rebooking $rebooking): RedirectResponse
    {
        if ($rebooking->status === 'completed') {
            return back()->with('error', 'Cannot delete completed rebookings.');
        }

        $rebooking->delete();

        return redirect()->route('rebookings.index')
            ->with('success', 'Rebooking request deleted successfully.');
    }
}
