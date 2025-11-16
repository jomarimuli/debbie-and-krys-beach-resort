<x-mail::message>
# Rebooking Request Submitted

Dear **{{ $rebooking->originalBooking->guest_name }}**,

Your rebooking request has been submitted successfully and is pending approval.

## Rebooking Information

- **Rebooking Number:** {{ $rebooking->rebooking_number }}
- **Original Booking:** {{ $rebooking->originalBooking->booking_number }}
- **Status:** {{ ucfirst($rebooking->status) }}

## Original Booking Details

- **Check-in:** {{ \Carbon\Carbon::parse($rebooking->originalBooking->check_in_date)->format('F d, Y') }}
@if($rebooking->originalBooking->check_out_date)
- **Check-out:** {{ \Carbon\Carbon::parse($rebooking->originalBooking->check_out_date)->format('F d, Y') }}
@endif
- **Guests:** {{ $rebooking->originalBooking->total_adults }} Adults, {{ $rebooking->originalBooking->total_children }} Children
- **Amount:** ₱{{ number_format($rebooking->original_amount, 2) }}

## New Booking Details

- **Check-in:** {{ \Carbon\Carbon::parse($rebooking->new_check_in_date)->format('F d, Y') }}
@if($rebooking->new_check_out_date)
- **Check-out:** {{ \Carbon\Carbon::parse($rebooking->new_check_out_date)->format('F d, Y') }}
@endif
- **Guests:** {{ $rebooking->new_total_adults }} Adults, {{ $rebooking->new_total_children }} Children
- **Amount:** ₱{{ number_format($rebooking->new_amount, 2) }}

## Financial Impact

| Description | Amount |
|:------------|-------:|
| Amount Difference | {{ $rebooking->amount_difference >= 0 ? '+' : '' }}₱{{ number_format(abs($rebooking->amount_difference), 2) }} |
@if($rebooking->rebooking_fee > 0)
| Rebooking Fee | ₱{{ number_format($rebooking->rebooking_fee, 2) }} |
@endif
| **Total Adjustment** | **{{ $rebooking->total_adjustment >= 0 ? '+' : '' }}₱{{ number_format(abs($rebooking->total_adjustment), 2) }}** |

@if($rebooking->total_adjustment > 0)
<x-mail::panel>
**Additional Payment Required:** ₱{{ number_format($rebooking->total_adjustment, 2) }}
</x-mail::panel>
@elseif($rebooking->total_adjustment < 0)
<x-mail::panel>
**Refund Amount:** ₱{{ number_format(abs($rebooking->total_adjustment), 2) }}
</x-mail::panel>
@endif

<x-mail::button :url="route('rebookings.show', $rebooking)">
View Rebooking Details
</x-mail::button>

We will review your request and notify you once it's approved.

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
