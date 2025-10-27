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
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $payments = Payment::with(['booking'])
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

        $paymentAccounts = PaymentAccount::active()
            ->ordered()
            ->get();

        return Inertia::render('payment/create', [
            'bookings' => $bookings,
            'payment_accounts' => $paymentAccounts,
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
        $payment->load(['booking', 'paymentAccount', 'receivedByUser']);

        return Inertia::render('payment/show', [
            'payment' => $payment,
        ]);
    }

    public function edit(Payment $payment): Response
    {
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

            if ($payment->reference_image) {
                $this->deleteImageFromPrivate($payment->reference_image);
            }

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

    public function showReferenceImage(Payment $payment): StreamedResponse
    {
        if (!$payment->reference_image || !Storage::disk('local')->exists($payment->reference_image)) {
            abort(404);
        }

        return Storage::disk('local')->response($payment->reference_image);
    }

    protected function uploadImageToPrivate($file, string $folder): string
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $sanitizedName = \Illuminate\Support\Str::slug($originalName);
        $timestamp = now()->timestamp;
        $filename = "{$sanitizedName}_{$timestamp}.{$extension}";

        return $file->storeAs($folder, $filename, 'local');
    }

    protected function deleteImageFromPrivate(?string $path): bool
    {
        if ($path && Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->delete($path);
        }

        return false;
    }
}
