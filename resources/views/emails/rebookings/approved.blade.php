<x-mail::message>
# Rebooking Approved

Dear **{{ $rebooking->originalBooking->guest_name }}**,

Great news! Your rebooking request has been **approved**.

## Rebooking Information

- **Rebooking Number:** {{ $rebooking->rebooking_number }}
- **Original Booking:** {{ $rebooking->originalBooking->booking_number }}

## New Booking Details

- **Check-in:** {{ \Carbon\Carbon::parse($rebooking->new_check_in_date)->format('F d, Y') }}
@if($rebooking->new_check_out_date)
- **Check-out:** {{ \Carbon\Carbon::parse($rebooking->new_check_out_date)->format('F d, Y') }}
@endif
- **Guests:** {{ $rebooking->new_total_adults }} Adults, {{ $rebooking->new_total_children }} Children

## Financial Summary

| Description | Amount |
|:------------|-------:|
| New Total Amount | ₱{{ number_format($rebooking->new_amount, 2) }} |
| Total Adjustment | {{ $rebooking->total_adjustment >= 0 ? '+' : '' }}₱{{ number_format(abs($rebooking->total_adjustment), 2) }} |

@if($rebooking->total_adjustment > 0)
<x-mail::panel>
**Action Required:** Please make an additional payment of ₱{{ number_format($rebooking->total_adjustment, 2) }}.
</x-mail::panel>
@elseif($rebooking->total_adjustment < 0)
<x-mail::panel>
**Refund:** A refund of ₱{{ number_format(abs($rebooking->total_adjustment), 2) }} will be processed.
</x-mail::panel>
@endif

<x-mail::button :url="route('rebookings.show', $rebooking)">
View Rebooking Details
</x-mail::button>

@if($rebooking->remarks)
## Admin Notes

{{ $rebooking->remarks }}
@endif

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
