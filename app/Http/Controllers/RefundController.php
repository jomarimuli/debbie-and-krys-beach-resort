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
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $refunds = Refund::with(['payment.booking'])
            ->latest('refund_date')
            ->paginate(10);

        return Inertia::render('refund/index', [
            'refunds' => $refunds,
        ]);
    }

    public function create(): Response
    {
        $payments = Payment::with('booking')
            ->whereHas('booking', function ($query) {
                $query->whereIn('status', ['confirmed', 'completed', 'cancelled']);
            })
            ->get()
            ->filter(function ($payment) {
                return $payment->remainingAmount() > 0;
            })
            ->values();

        $paymentAccounts = PaymentAccount::active()
            ->ordered()
            ->get();

        return Inertia::render('refund/create', [
            'payments' => $payments,
            'payment_accounts' => $paymentAccounts,
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

            DB::commit();

            return redirect()->route('payments.show', $refund->payment)
                ->with('success', 'Refund processed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(Refund $refund): Response
    {
        $refund->load(['payment.booking', 'refundAccount', 'processedByUser']);

        return Inertia::render('refund/show', [
            'refund' => $refund,
        ]);
    }

    public function edit(Refund $refund): Response
    {
        $refund->load('payment.booking');

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

            if ($refund->reference_image) {
                $this->deleteImageFromPrivate($refund->reference_image);
            }

            $refund->delete();

            DB::commit();

            return redirect()->route('payments.show', $payment)
                ->with('success', 'Refund deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function showReferenceImage(Refund $refund): StreamedResponse
    {
        if (!$refund->reference_image || !Storage::disk('local')->exists($refund->reference_image)) {
            abort(404);
        }

        return Storage::disk('local')->response($refund->reference_image);
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
