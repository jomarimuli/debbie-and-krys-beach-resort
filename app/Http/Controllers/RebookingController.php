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
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

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

    public function create(Booking $booking): Response
    {
        // Check if customer is trying to rebook someone else's booking
        if (auth()->user()->hasRole('customer') && $booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Load booking relationships
        $booking->load([
            'accommodations.accommodation',
            'accommodations.accommodationRate',
            'entranceFees',
        ]);

        $accommodations = Accommodation::with('rates')->active()->orderBy('name')->get();

        return Inertia::render('rebooking/create', [
            'booking' => $booking,
            'accommodations' => $accommodations,
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

            DB::commit();

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

    // Customers should not be able to approve/reject/complete rebookings
    public function approve(ApproveRebookingRequest $request, Rebooking $rebooking): RedirectResponse
    {
        // Only admin/staff can approve
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        if ($rebooking->status !== 'pending') {
            return back()->with('error', 'Only pending rebookings can be approved.');
        }

        DB::beginTransaction();
        try {
            $totalAdjustment = $rebooking->amount_difference + $request->rebooking_fee;

            $rebooking->update([
                'status' => 'approved',
                'rebooking_fee' => $request->rebooking_fee,
                'total_adjustment' => $totalAdjustment,
                'admin_notes' => $request->admin_notes,
                'approved_at' => now(),
            ]);

            DB::commit();

            return back()->with('success', 'Rebooking request approved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function reject(RejectRebookingRequest $request, Rebooking $rebooking): RedirectResponse
    {
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

        return back()->with('success', 'Rebooking request cancelled.');
    }

    public function complete(Rebooking $rebooking): RedirectResponse
    {
        // Only admin/staff can complete
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        if ($rebooking->status !== 'approved') {
            return back()->with('error', 'Only approved rebookings can be completed.');
        }

        DB::beginTransaction();
        try {
            // Update the original booking with new details
            $originalBooking = $rebooking->originalBooking;

            $originalBooking->update([
                'check_in_date' => $rebooking->new_check_in_date,
                'check_out_date' => $rebooking->new_check_out_date,
                'total_adults' => $rebooking->new_total_adults,
                'total_children' => $rebooking->new_total_children,
                'total_guests' => $rebooking->new_total_guests,
                'accommodation_total' => $rebooking->accommodations->sum('subtotal'),
                'entrance_fee_total' => $rebooking->entranceFees->sum('subtotal'),
                'total_amount' => $rebooking->new_amount,
            ]);

            // Delete old accommodations and entrance fees
            $originalBooking->accommodations()->delete();
            $originalBooking->entranceFees()->delete();

            // Copy rebooking accommodations to booking
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

            // Copy rebooking entrance fees to booking
            foreach ($rebooking->entranceFees as $rebookingFee) {
                $originalBooking->entranceFees()->create([
                    'type' => $rebookingFee->type,
                    'quantity' => $rebookingFee->quantity,
                    'rate' => $rebookingFee->rate,
                    'subtotal' => $rebookingFee->subtotal,
                ]);
            }

            // Recalculate booking balance
            $originalBooking->balance = $originalBooking->total_amount - $originalBooking->paid_amount;
            $originalBooking->is_fully_paid = $originalBooking->balance <= 0;
            $originalBooking->save();

            // Update rebooking status
            $rebooking->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            DB::commit();

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
