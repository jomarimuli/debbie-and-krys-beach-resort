<x-mail::message>
# Booking Confirmed

Dear **{{ $booking->guest_name }}**,

Great news! Your booking has been **confirmed**.

## Booking Information

- **Booking Number:** {{ $booking->booking_number }}
- **Check-in:** {{ \Carbon\Carbon::parse($booking->check_in_date)->format('F d, Y') }}
@if($booking->check_out_date)
- **Check-out:** {{ \Carbon\Carbon::parse($booking->check_out_date)->format('F d, Y') }}
@endif
- **Guests:** {{ $booking->total_adults }} Adults, {{ $booking->total_children }} Children

## Payment Status

| Description | Amount |
|:------------|-------:|
| Total Amount | ₱{{ number_format($booking->total_amount, 2) }} |
| Paid Amount | ₱{{ number_format($booking->paid_amount, 2) }} |
| **Balance** | **₱{{ number_format($booking->balance, 2) }}** |

@if($booking->balance > 0)
<x-mail::panel>
**Payment Reminder:** You have a remaining balance of ₱{{ number_format($booking->balance, 2) }}.
</x-mail::panel>
@endif

<x-mail::button :url="route('bookings.show', $booking)">
View Booking Details
</x-mail::button>

We look forward to welcoming you!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
