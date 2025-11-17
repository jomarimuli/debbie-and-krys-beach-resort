<x-mail::message>
# Rebooking Cancelled

Dear **{{ $rebooking->originalBooking->guest_name }}**,

Your rebooking request has been cancelled.

## Rebooking Information

- **Rebooking Number:** {{ $rebooking->rebooking_number }}
- **Original Booking:** {{ $rebooking->originalBooking->booking_number }}

Your original booking remains unchanged:

- **Check-in:** {{ \Carbon\Carbon::parse($rebooking->originalBooking->check_in_date)->format('F d, Y') }}
@if($rebooking->originalBooking->check_out_date)
- **Check-out:** {{ \Carbon\Carbon::parse($rebooking->originalBooking->check_out_date)->format('F d, Y') }}
@endif

<x-mail::button :url="route('bookings.show', $rebooking->originalBooking)">
View Original Booking
</x-mail::button>

If you would like to submit a new rebooking request, please contact us.

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
