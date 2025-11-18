<?php

namespace App\Http\Controllers;

use App\Models\Refund;
use App\Models\Payment;
use App\Models\PaymentAccount;
use App\Http\Requests\Refund\StoreRefundRequest;
use App\Http\Requests\Refund\UpdateRefundRequest;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Mail;
use App\Mail\RefundProcessed;

class RefundController extends Controller
{
    use HandlesImageUpload;

    public function __construct()
    {
        $this->middleware('permission:refund show|global access')->only(['index', 'show', 'showReferenceImage']);
        $this->middleware('permission:refund create|global access')->only(['create', 'store']);
        $this->middleware('permission:refund edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:refund delete|global access')->only('destroy');
    }

    public function index(): Response
    {
        $query = Refund::with(['payment.booking', 'rebooking']);

        if (auth()->user()->hasRole('customer')) {
            $query->whereHas('payment.booking', function ($q) {
                $q->where('created_by', auth()->id());
            });
        }

        $refunds = $query->latest('refund_date')->paginate(10);

        return Inertia::render('refund/index', [
            'refunds' => $refunds,
        ]);
    }

    public function create(): Response
    {
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        $payments = Payment::with(['booking', 'refunds'])
            ->get()
            ->filter(function ($payment) {
                return $payment->remaining_amount > 0;
            })
            ->values();

        $rebookings = \App\Models\Rebooking::with(['originalBooking', 'payments'])
            ->where('status', 'approved')
            ->where('payment_status', 'pending')
            ->where('total_adjustment', '<', 0)
            ->latest()
            ->get();

        $paymentAccounts = PaymentAccount::active()
            ->ordered()
            ->get();

        // Get query params for pre-selection
        $rebookingId = request()->query('rebooking_id');

        return Inertia::render('refund/create', [
            'payments' => $payments,
            'rebookings' => $rebookings,
            'payment_accounts' => $paymentAccounts,
            'preselected_rebooking_id' => $rebookingId,
        ]);
    }

    public function store(StoreRefundRequest $request): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();

            if ($request->hasFile('reference_image')) {
                $data['reference_image'] = $this->uploadImageToPrivate(
                    $request->file('reference_image'),
                    'refunds'
                );
            }

            $refund = Refund::create([
                ...$data,
                'processed_by' => auth()->id(),
            ]);

            $refund->load(['payment.booking', 'refundAccount', 'processedByUser']);

            DB::commit();

            try {
                if ($refund->payment->booking->guest_email) {
                    Mail::to($refund->payment->booking->guest_email)->send(new RefundProcessed($refund));
                }
            } catch (\Exception $e) {
                Log::error('Refund email failed: ' . $e->getMessage());
            }

            if ($refund->rebooking_id) {
                return redirect()->route('rebookings.show', $refund->rebooking_id)
                    ->with('success', 'Rebooking refund processed successfully.');
            }

            return redirect()->route('payments.show', $refund->payment)
                ->with('success', 'Refund processed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Refund $refund): Response
    {
        if (auth()->user()->hasRole('customer') && $refund->payment->booking->created_by !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $refund->load(['payment.booking', 'rebooking', 'refundAccount', 'processedByUser']);

        return Inertia::render('refund/show', [
            'refund' => $refund,
        ]);
    }

    public function edit(Refund $refund): Response
    {
        $refund->load(['payment.booking', 'rebooking']);

        $paymentAccounts = PaymentAccount::active()
            ->ordered()
            ->get();

        return Inertia::render('refund/edit', [
            'refund' => $refund,
            'payment_accounts' => $paymentAccounts,
        ]);
    }

    public function update(UpdateRefundRequest $request, Refund $refund): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();

            if ($request->hasFile('reference_image')) {
                if ($refund->reference_image) {
                    $this->deleteImageFromPrivate($refund->reference_image);
                }

                $data['reference_image'] = $this->uploadImageToPrivate(
                    $request->file('reference_image'),
                    'refunds'
                );
            } elseif ($request->input('remove_reference_image')) {
                if ($refund->reference_image) {
                    $this->deleteImageFromPrivate($refund->reference_image);
                }
                $data['reference_image'] = null;
            }

            $refund->update($data);

            DB::commit();

            if ($refund->rebooking_id) {
                return redirect()->route('rebookings.show', $refund->rebooking_id)
                    ->with('success', 'Rebooking refund updated successfully.');
            }

            return redirect()->route('payments.show', $refund->payment)
                ->with('success', 'Refund updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(Refund $refund): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $payment = $refund->payment;
            $rebookingId = $refund->rebooking_id;

            if ($refund->reference_image) {
                $this->deleteImageFromPrivate($refund->reference_image);
            }

            $refund->delete();

            DB::commit();

            if ($rebookingId) {
                return redirect()->route('rebookings.show', $rebookingId)
                    ->with('success', 'Rebooking refund deleted successfully.');
            }

            return redirect()->route('payments.show', $payment)
                ->with('success', 'Refund deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function showReferenceImage(Refund $refund): StreamedResponse
    {
        if (!$refund->reference_image || !Storage::disk('public')->exists($refund->reference_image)) {
            abort(404);
        }

        return Storage::disk('public')->response($refund->reference_image);
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
