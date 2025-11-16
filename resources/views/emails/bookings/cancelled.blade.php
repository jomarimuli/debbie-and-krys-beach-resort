<x-mail::message>
# Booking Cancelled

Dear **{{ $booking->guest_name }}**,

Your booking has been cancelled.

## Booking Information

- **Booking Number:** {{ $booking->booking_number }}
- **Original Check-in:** {{ \Carbon\Carbon::parse($booking->check_in_date)->format('F d, Y') }}
@if($booking->check_out_date)
- **Original Check-out:** {{ \Carbon\Carbon::parse($booking->check_out_date)->format('F d, Y') }}
@endif

@if($booking->paid_amount > 0)
## Refund Information

You had paid ₱{{ number_format($booking->paid_amount, 2) }}. Our team will process your refund according to our cancellation policy.

If you have any questions about your refund, please contact us.
@endif

<x-mail::button :url="route('bookings.show', $booking)">
View Booking Details
</x-mail::button>

If you cancelled by mistake or would like to make a new booking, please contact us.

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
