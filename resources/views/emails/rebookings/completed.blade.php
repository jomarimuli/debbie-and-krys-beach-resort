<x-mail::message>
# Rebooking Completed

Dear **{{ $rebooking->originalBooking->guest_name }}**,

Your rebooking has been completed successfully! Your original booking has been updated with the new details.

## Updated Booking Information

- **Booking Number:** {{ $rebooking->originalBooking->booking_number }}
- **Check-in:** {{ \Carbon\Carbon::parse($rebooking->new_check_in_date)->format('F d, Y') }}
@if($rebooking->new_check_out_date)
- **Check-out:** {{ \Carbon\Carbon::parse($rebooking->new_check_out_date)->format('F d, Y') }}
@endif
- **Guests:** {{ $rebooking->new_total_adults }} Adults, {{ $rebooking->new_total_children }} Children

<x-mail::button :url="route('bookings.show', $rebooking->originalBooking)">
View Updated Booking
</x-mail::button>

We look forward to welcoming you on your new dates!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
