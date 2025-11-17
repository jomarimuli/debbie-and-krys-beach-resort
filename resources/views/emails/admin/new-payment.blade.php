<x-mail::message>
# New Payment Received

A payment has been recorded in the system.

## Payment Information

- **Payment Number:** {{ $payment->payment_number }}
- **Amount:** ₱{{ number_format($payment->amount, 2) }}
- **Payment Method:** {{ ucwords(str_replace('_', ' ', $payment->payment_method)) }}
- **Payment Date:** {{ \Carbon\Carbon::parse($payment->payment_date)->format('F d, Y') }}
- **Recorded:** {{ $payment->created_at->format('F d, Y h:i A') }}

@if($payment->reference_number)
- **Reference Number:** {{ $payment->reference_number }}
@endif

@if($payment->is_down_payment)
<x-mail::panel>
This is a **Down Payment**
</x-mail::panel>
@endif

@if($payment->is_rebooking_payment)
<x-mail::panel>
This is a **Rebooking Payment**
</x-mail::panel>
@endif

## Booking Details

- **Booking Number:** {{ $payment->booking->booking_number }}
- **Guest Name:** {{ $payment->booking->guest_name }}
@if($payment->booking->guest_email)
- **Guest Email:** {{ $payment->booking->guest_email }}
@endif

## Financial Summary

| Description | Amount |
|:------------|-------:|
| Total Booking Amount | ₱{{ number_format($payment->booking->total_amount, 2) }} |
| Total Paid | ₱{{ number_format($payment->booking->paid_amount, 2) }} |
| **Remaining Balance** | **₱{{ number_format($payment->booking->balance, 2) }}** |

@if($payment->booking->down_payment_required)
### Down Payment Status

| Description | Amount |
|:------------|-------:|
| Required | ₱{{ number_format($payment->booking->down_payment_amount, 2) }} |
| Paid | ₱{{ number_format($payment->booking->down_payment_paid, 2) }} |
| Balance | ₱{{ number_format($payment->booking->down_payment_balance, 2) }} |
@endif

@if($payment->payment_account_id)
**Payment Account:** {{ $payment->paymentAccount->account_name }}
@if($payment->paymentAccount->account_number)
({{ $payment->paymentAccount->account_number }})
@endif
@endif

@if($payment->notes)
## Payment Notes

{{ $payment->notes }}
@endif

<x-mail::button :url="route('payments.show', $payment)">
View Payment Details
</x-mail::button>

---

**Received by:** {{ $payment->receivedByUser->name ?? 'System' }}

This is an automated notification from {{ config('app.name') }}.
</x-mail::message>
