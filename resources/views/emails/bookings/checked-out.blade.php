<x-mail::message>
# Thank You for Your Stay!

Dear **{{ $booking->guest_name }}**,

Thank you for staying with us! You have successfully checked out.

## Booking Summary

- **Booking Number:** {{ $booking->booking_number }}
- **Check-in:** {{ \Carbon\Carbon::parse($booking->check_in_date)->format('F d, Y') }}
@if($booking->check_out_date)
- **Check-out:** {{ \Carbon\Carbon::parse($booking->check_out_date)->format('F d, Y') }}
@endif

## Final Payment Summary

| Description | Amount |
|:------------|-------:|
| Total Amount | ₱{{ number_format($booking->total_amount, 2) }} |
| Total Paid | ₱{{ number_format($booking->paid_amount, 2) }} |
| Balance | ₱{{ number_format($booking->balance, 2) }} |

<x-mail::button :url="route('bookings.show', $booking)">
View Booking Details
</x-mail::button>

We hope you enjoyed your stay! We'd love to hear your feedback.

<x-mail::button :url="route('feedbacks.create', ['booking_id' => $booking->id])">
Share Your Feedback
</x-mail::button>

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
