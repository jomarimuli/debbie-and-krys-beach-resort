<x-mail::message>
# Booking Confirmation

Dear **{{ $booking->guest_name }}**,

Thank you for your booking! Your reservation has been created successfully.

## Booking Details

- **Booking Number:** {{ $booking->booking_number }}
- **Booking Code:** `{{ $booking->booking_code }}`
- **Status:** {{ ucfirst($booking->status) }}

## Stay Information

- **Check-in Date:** {{ \Carbon\Carbon::parse($booking->check_in_date)->format('F d, Y') }}
@if($booking->check_out_date)
- **Check-out Date:** {{ \Carbon\Carbon::parse($booking->check_out_date)->format('F d, Y') }}
@endif
- **Booking Type:** {{ ucwords(str_replace('_', ' ', $booking->booking_type)) }}
- **Guests:** {{ $booking->total_adults }} Adults, {{ $booking->total_children }} Children

## Accommodations

@foreach($booking->accommodations as $item)
- **{{ $item->accommodation->name }}** ({{ $item->guests }} guests) - ₱{{ number_format($item->subtotal, 2) }}
@endforeach

## Financial Summary

| Description | Amount |
|:------------|-------:|
| Accommodation Total | ₱{{ number_format($booking->accommodation_total, 2) }} |
| Entrance Fee Total | ₱{{ number_format($booking->entrance_fee_total, 2) }} |
| **Total Amount** | **₱{{ number_format($booking->total_amount, 2) }}** |

@if($booking->down_payment_required)
### Down Payment Required

| Description | Amount |
|:------------|-------:|
| Down Payment Amount | ₱{{ number_format($booking->down_payment_amount, 2) }} |
| Down Payment Balance | ₱{{ number_format($booking->down_payment_balance, 2) }} |
@endif

| Description | Amount |
|:------------|-------:|
| Paid Amount | ₱{{ number_format($booking->paid_amount, 2) }} |
| **Remaining Balance** | **₱{{ number_format($booking->balance, 2) }}** |

<x-mail::button :url="route('bookings.show', $booking)">
View Booking Details
</x-mail::button>

Thank you for choosing {{ config('app.name') }}!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
