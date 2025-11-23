<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Booking;
use App\Models\PaymentAccount;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Requests\Payment\UpdatePaymentRequest;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Mail;
use App\Services\NotificationService;
use App\Mail\PaymentReceived;
use App\Mail\Admin\NewPaymentNotification;

class PaymentController extends Controller
{
    use HandlesImageUpload;

    public function __construct()
    {
        $this->middleware('permission:payment show|global access')->only(['index', 'show', 'showReferenceImage']);
        $this->middleware('permission:payment create|global access')->only(['create', 'store']);
        $this->middleware('permission:payment edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:payment delete|global access')->only('destroy');
    }

    public function index(): Response
    {
        $query = Payment::with(['booking', 'rebooking', 'paymentAccount', 'receivedByUser']);

        // Customers can only see payments for their own bookings
        if (auth()->user()->hasRole('customer')) {
            $query->whereHas('booking', function ($q) {
                $q->where('created_by', auth()->id());
            });
        }

        $payments = $query->latest('payment_date')->paginate(100);

        return Inertia::render('payment/index', [
            'payments' => $payments,
        ]);
    }

    public function create(): Response
    {
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        $bookings = Booking::with(['rebookings' => function ($q) {
                $q->whereIn('status', ['approved'])
                    ->where('payment_status', 'pending')
                    ->latest();
            }])
            ->get()
            ->filter(function ($booking) {
                return $booking->balance > 0;
            })
            ->values();

        $rebookings = \App\Models\Rebooking::with(['originalBooking'])
            ->where('status', 'approved')
            ->where('payment_status', 'pending')
            ->where('total_adjustment', '>', 0)
            ->latest()
            ->get();

        $paymentAccounts = PaymentAccount::active()
            ->ordered()
            ->get();

        // Get query params for pre-selection
        $rebookingId = request()->query('rebooking_id');

        return Inertia::render('payment/create', [
            'bookings' => $bookings,
            'rebookings' => $rebookings,
            'payment_accounts' => $paymentAccounts,
            'preselected_rebooking_id' => $rebookingId,
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();

            if ($request->hasFile('reference_image')) {
                $data['reference_image'] = $this->uploadImageToPrivate(
                    $request->file('reference_image'),
                    'payments'
                );
            }

            $payment = Payment::create([
                ...$data,
                'received_by' => auth()->id(),
            ]);

            // Load relationships for emails
            $payment->load(['booking', 'paymentAccount', 'receivedByUser']);

            DB::commit();

            // Send email notifications
            try {
                // Send to customer
                if ($payment->booking->guest_email) {
                    Mail::to($payment->booking->guest_email)->send(new PaymentReceived($payment));
                }

                // Send to admin/staff
                $adminEmails = NotificationService::getAdminStaffEmails();
                if (!empty($adminEmails)) {
                    Mail::to($adminEmails)->send(new NewPaymentNotification($payment));
                }
            } catch (\Exception $e) {
                Log::error('Payment email failed: ' . $e->getMessage());
            }

            // Redirect based on whether it's a rebooking payment or regular payment
            if ($payment->rebooking_id) {
                return redirect()->route('rebookings.show', $payment->rebooking_id)
                    ->with('success', 'Rebooking payment recorded successfully.');
            }

            return redirect()->route('bookings.show', $payment->booking)
                ->with('success', 'Payment recorded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Payment $payment): Response
    {
        // Check if customer is trying to view someone else's payment
        if (auth()->user()->hasRole('customer') && $payment->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $payment->load(['booking', 'rebooking', 'paymentAccount', 'receivedByUser', 'refunds']);

        return Inertia::render('payment/show', [
            'payment' => $payment,
        ]);
    }

    public function edit(Payment $payment): Response
    {
        $payment->load(['rebooking']);

        $paymentAccounts = PaymentAccount::active()
            ->ordered()
            ->get();

        return Inertia::render('payment/edit', [
            'payment' => $payment,
            'payment_accounts' => $paymentAccounts,
        ]);
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();

            if ($request->hasFile('reference_image')) {
                if ($payment->reference_image) {
                    $this->deleteImageFromPrivate($payment->reference_image);
                }

                $data['reference_image'] = $this->uploadImageToPrivate(
                    $request->file('reference_image'),
                    'payments'
                );
            } elseif ($request->input('remove_reference_image')) {
                if ($payment->reference_image) {
                    $this->deleteImageFromPrivate($payment->reference_image);
                }
                $data['reference_image'] = null;
            }

            $payment->update($data);

            // Update booking paid amounts (handled by Payment model boot method)
            // booking->updatePaidAmount() is called automatically

            DB::commit();

            // Redirect based on whether it's a rebooking payment or regular payment
            if ($payment->rebooking_id) {
                return redirect()->route('rebookings.show', $payment->rebooking_id)
                    ->with('success', 'Rebooking payment updated successfully.');
            }

            return redirect()->route('bookings.show', $payment->booking)
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
            $rebookingId = $payment->rebooking_id;

            if ($payment->reference_image) {
                $this->deleteImageFromPrivate($payment->reference_image);
            }

            $payment->delete();

            // Update booking paid amounts (handled by Payment model boot method)
            // booking->updatePaidAmount() is called automatically

            DB::commit();

            // Redirect based on whether it's a rebooking payment or regular payment
            if ($rebookingId) {
                return redirect()->route('rebookings.show', $rebookingId)
                    ->with('success', 'Rebooking payment deleted successfully.');
            }

            return redirect()->route('bookings.show', $booking)
                ->with('success', 'Payment deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function showReferenceImage(Payment $payment): StreamedResponse
    {
        if (!$payment->reference_image || !Storage::disk('public')->exists($payment->reference_image)) {
            abort(404);
        }

        return Storage::disk('public')->response($payment->reference_image);
    }

    protected function uploadImageToPrivate($file, string $folder): string
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $sanitizedName = \Illuminate\Support\Str::slug($originalName);
        $timestamp = now()->timestamp;
        $filename = "{$sanitizedName}_{$timestamp}.{$extension}";

        return $file->storeAs($folder, $filename, 'public');
    }

    protected function deleteImageFromPrivate(?string $path): bool
    {
        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }
}
