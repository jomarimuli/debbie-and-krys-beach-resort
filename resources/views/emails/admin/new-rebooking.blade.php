<x-mail::message>
# New Rebooking Request - Action Required

A rebooking request has been submitted and requires review.

## Rebooking Information

- **Rebooking Number:** {{ $rebooking->rebooking_number }}
- **Original Booking:** {{ $rebooking->originalBooking->booking_number }}
- **Status:** {{ ucfirst($rebooking->status) }}
- **Submitted:** {{ $rebooking->created_at->format('F d, Y h:i A') }}

## Guest Details

- **Name:** {{ $rebooking->originalBooking->guest_name }}
@if($rebooking->originalBooking->guest_email)
- **Email:** {{ $rebooking->originalBooking->guest_email }}
@endif
@if($rebooking->originalBooking->guest_phone)
- **Phone:** {{ $rebooking->originalBooking->guest_phone }}
@endif

## Original vs New Details

| Details | Original | New |
|:--------|:---------|:----|
| Check-in | {{ \Carbon\Carbon::parse($rebooking->originalBooking->check_in_date)->format('M d, Y') }} | {{ \Carbon\Carbon::parse($rebooking->new_check_in_date)->format('M d, Y') }} |
@if($rebooking->originalBooking->check_out_date)
| Check-out | {{ \Carbon\Carbon::parse($rebooking->originalBooking->check_out_date)->format('M d, Y') }} | {{ \Carbon\Carbon::parse($rebooking->new_check_out_date)->format('M d, Y') }} |
@endif
| Adults | {{ $rebooking->originalBooking->total_adults }} | {{ $rebooking->new_total_adults }} |
| Children | {{ $rebooking->originalBooking->total_children }} | {{ $rebooking->new_total_children }} |
| Amount | ₱{{ number_format($rebooking->original_amount, 2) }} | ₱{{ number_format($rebooking->new_amount, 2) }} |

## Financial Impact

| Description | Amount |
|:------------|-------:|
| Amount Difference | {{ $rebooking->amount_difference >= 0 ? '+' : '' }}₱{{ number_format(abs($rebooking->amount_difference), 2) }} |
| Rebooking Fee | ₱{{ number_format($rebooking->rebooking_fee, 2) }} |
| **Total Adjustment** | **{{ $rebooking->total_adjustment >= 0 ? '+' : '' }}₱{{ number_format(abs($rebooking->total_adjustment), 2) }}** |

@if($rebooking->total_adjustment > 0)
<x-mail::panel>
**Customer will need to pay:** ₱{{ number_format($rebooking->total_adjustment, 2) }}
</x-mail::panel>
@elseif($rebooking->total_adjustment < 0)
<x-mail::panel>
**Customer will receive refund:** ₱{{ number_format(abs($rebooking->total_adjustment), 2) }}
</x-mail::panel>
@endif

@if($rebooking->reason)
## Customer's Reason

{{ $rebooking->reason }}
@endif

## New Accommodations

@foreach($rebooking->accommodations as $item)
- **{{ $item->accommodation->name }}:** {{ $item->guests }} guests - ₱{{ number_format($item->subtotal, 2) }}
@endforeach

<x-mail::button :url="route('rebookings.show', $rebooking)">
Review Rebooking Request
</x-mail::button>

@if($rebooking->status === 'pending')
<x-mail::panel>
**Action Required:** This rebooking request is waiting for approval.
</x-mail::panel>
@endif

---

**Requested by:** {{ $rebooking->processedByUser->name ?? 'Customer' }}

This is an automated notification from {{ config('app.name') }}.
</x-mail::message>
