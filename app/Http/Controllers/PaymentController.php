<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Booking;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Requests\Payment\UpdatePaymentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:payment show|global access')->only(['index', 'show']);
        $this->middleware('permission:payment create|global access')->only(['create', 'store']);
        $this->middleware('permission:payment edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:payment delete|global access')->only('destroy');
    }

    public function index(): Response
    {
        $payments = Payment::with(['booking', 'receivedBy'])
            ->latest('payment_date')
            ->paginate(10);

        return Inertia::render('payment/index', [
            'payments' => $payments,
        ]);
    }

    public function create(): Response
    {
        $bookings = Booking::whereIn('status', ['pending', 'confirmed'])
            ->whereColumn('paid_amount', '<', 'total_amount')
            ->orderBy('booking_number')
            ->get();

        return Inertia::render('payment/create', [
            'bookings' => $bookings,
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $payment = Payment::create([
                ...$request->validated(),
                'received_by' => auth()->id(),
            ]);

            $booking = $payment->booking;
            $booking->update([
                'paid_amount' => $booking->payments()->sum('amount'),
            ]);

            DB::commit();

            return redirect()->route('bookings.show', $booking)
                ->with('success', 'Payment recorded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Payment $payment): Response
    {
        $payment->load(['booking', 'receivedBy']);

        return Inertia::render('payment/show', [
            'payment' => $payment,
        ]);
    }

    public function edit(Payment $payment): Response
    {
        return Inertia::render('payment/edit', [
            'payment' => $payment,
        ]);
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $payment->update($request->validated());

            $booking = $payment->booking;
            $booking->update([
                'paid_amount' => $booking->payments()->sum('amount'),
            ]);

            DB::commit();

            return redirect()->route('bookings.show', $booking)
                ->with('success', 'Payment updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $booking = $payment->booking;
            $payment->delete();

            $booking->update([
                'paid_amount' => $booking->payments()->sum('amount'),
            ]);

            DB::commit();

            return redirect()->route('bookings.show', $booking)
                ->with('success', 'Payment deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }
}
