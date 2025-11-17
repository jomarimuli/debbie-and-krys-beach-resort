<x-mail::message>
# Welcome! Check-In Confirmed

Dear **{{ $booking->guest_name }}**,

You have successfully checked in!

## Booking Details

- **Booking Number:** {{ $booking->booking_number }}
- **Check-in Date:** {{ \Carbon\Carbon::parse($booking->check_in_date)->format('F d, Y') }}
@if($booking->check_out_date)
- **Check-out Date:** {{ \Carbon\Carbon::parse($booking->check_out_date)->format('F d, Y') }}
@endif

## Your Accommodations

@foreach($booking->accommodations as $item)
- {{ $item->accommodation->name }} ({{ $item->guests }} guests)
@endforeach

<x-mail::button :url="route('bookings.show', $booking)">
View Booking Details
</x-mail::button>

Enjoy your stay at {{ config('app.name') }}!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
