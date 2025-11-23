<?php

namespace App\Http\Controllers;

use App\Models\PaymentAccount;
use App\Http\Requests\PaymentAccount\StorePaymentAccountRequest;
use App\Http\Requests\PaymentAccount\UpdatePaymentAccountRequest;
use App\Traits\HandlesImageUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PaymentAccountController extends Controller
{
    use HandlesImageUpload;

    public function __construct()
    {
        $this->middleware('permission:payment-account show|global access')->only(['index', 'show']);
        $this->middleware('permission:payment-account create|global access')->only(['create', 'store']);
        $this->middleware('permission:payment-account edit|global access')->only(['edit', 'update']);
        $this->middleware('permission:payment-account delete|global access')->only('destroy');
    }

    public function index(): Response
    {
        $paymentAccounts = PaymentAccount::query()
            ->ordered()
            ->paginate(100);

        return Inertia::render('payment-account/index', [
            'payment_accounts' => $paymentAccounts,
        ]);
    }

    public function create(): Response
    {
        // Customers cannot create payment accounts (admin/staff only)
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('payment-account/create');
    }

    public function store(StorePaymentAccountRequest $request): RedirectResponse
    {
        // Customers cannot create payment accounts (admin/staff only)
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        DB::beginTransaction();
        try {
            $data = $request->validated();

            if ($request->hasFile('qr_code')) {
                $data['qr_code'] = $this->uploadImage(
                    $request->file('qr_code'),
                    'payment-accounts'
                );
            }

            PaymentAccount::create($data);

            DB::commit();

            return redirect()->route('payment-accounts.index')
                ->with('success', 'Payment account created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(PaymentAccount $paymentAccount): Response
    {
        return Inertia::render('payment-account/show', [
            'payment_account' => $paymentAccount,
        ]);
    }

    public function edit(PaymentAccount $paymentAccount): Response
    {
        // Customers cannot edit payment accounts
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('payment-account/edit', [
            'payment_account' => $paymentAccount,
        ]);
    }

    public function update(UpdatePaymentAccountRequest $request, PaymentAccount $paymentAccount): RedirectResponse
    {
        // Customers cannot update payment accounts
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        DB::beginTransaction();
        try {
            $data = $request->validated();

            if ($request->hasFile('qr_code')) {
                if ($paymentAccount->qr_code) {
                    $this->deleteImage($paymentAccount->qr_code);
                }

                $data['qr_code'] = $this->uploadImage(
                    $request->file('qr_code'),
                    'payment-accounts'
                );
            } elseif ($request->input('remove_qr_code')) {
                if ($paymentAccount->qr_code) {
                    $this->deleteImage($paymentAccount->qr_code);
                }
                $data['qr_code'] = null;
            }

            $paymentAccount->update($data);

            DB::commit();

            return redirect()->route('payment-accounts.index')
                ->with('success', 'Payment account updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    public function destroy(PaymentAccount $paymentAccount): RedirectResponse
    {
        // Customers cannot delete payment accounts
        if (auth()->user()->hasRole('customer')) {
            abort(403, 'Unauthorized action.');
        }

        DB::beginTransaction();
        try {
            if ($paymentAccount->qr_code) {
                $this->deleteImage($paymentAccount->qr_code);
            }

            $paymentAccount->delete();

            DB::commit();

            return redirect()->route('payment-accounts.index')
                ->with('success', 'Payment account deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }
}
