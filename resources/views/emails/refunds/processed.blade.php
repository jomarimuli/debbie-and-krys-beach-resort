<x-mail::message>
# Refund Processed

Dear **{{ $refund->payment->booking->guest_name }}**,

Your refund has been processed.

## Refund Details

- **Refund Number:** {{ $refund->refund_number }}
- **Payment Number:** {{ $refund->payment->payment_number }}
- **Refund Amount:** ₱{{ number_format($refund->amount, 2) }}
- **Refund Method:** {{ ucwords(str_replace('_', ' ', $refund->refund_method)) }}
- **Refund Date:** {{ \Carbon\Carbon::parse($refund->refund_date)->format('F d, Y') }}

@if($refund->reference_number)
- **Reference Number:** {{ $refund->reference_number }}
@endif

@if($refund->is_rebooking_refund)
<x-mail::panel>
This is a **Rebooking Refund**
</x-mail::panel>
@endif

@if($refund->reason)
## Refund Reason

{{ $refund->reason }}
@endif

<x-mail::button :url="route('refunds.show', $refund)">
View Refund Details
</x-mail::button>

The refund will be processed according to your selected refund method. Please allow 3-7 business days for the refund to reflect in your account.

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
