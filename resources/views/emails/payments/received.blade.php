<x-mail::message>
# Payment Received

Dear **{{ $payment->booking->guest_name }}**,

We have received your payment. Thank you!

## Payment Details

- **Payment Number:** {{ $payment->payment_number }}
- **Booking Number:** {{ $payment->booking->booking_number }}
- **Amount Paid:** ₱{{ number_format($payment->amount, 2) }}
- **Payment Method:** {{ ucwords(str_replace('_', ' ', $payment->payment_method)) }}
- **Payment Date:** {{ \Carbon\Carbon::parse($payment->payment_date)->format('F d, Y') }}

@if($payment->reference_number)
- **Reference Number:** {{ $payment->reference_number }}
@endif

@if($payment->is_down_payment)
<x-mail::panel>
This is a **Down Payment**
</x-mail::panel>

## Down Payment Status

| Description | Amount |
|:------------|-------:|
| Down Payment Required | ₱{{ number_format($payment->booking->down_payment_amount, 2) }} |
| Down Payment Paid | ₱{{ number_format($payment->booking->down_payment_paid, 2) }} |
| Down Payment Balance | ₱{{ number_format($payment->booking->down_payment_balance, 2) }} |
@endif

@if($payment->is_rebooking_payment)
<x-mail::panel>
This is a **Rebooking Payment**
</x-mail::panel>
@endif

## Booking Balance

| Description | Amount |
|:------------|-------:|
| Total Booking Amount | ₱{{ number_format($payment->booking->total_amount, 2) }} |
| Total Paid | ₱{{ number_format($payment->booking->paid_amount, 2) }} |
| **Remaining Balance** | **₱{{ number_format($payment->booking->balance, 2) }}** |

<x-mail::button :url="route('payments.show', $payment)">
View Payment Receipt
</x-mail::button>

Thank you for your payment!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
