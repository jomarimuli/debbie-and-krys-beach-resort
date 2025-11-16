<x-mail::message>
# New Booking Received

A new booking has been created in the system.

## Booking Information

- **Booking Number:** {{ $booking->booking_number }}
- **Booking Code:** `{{ $booking->booking_code }}`
- **Status:** {{ ucfirst($booking->status) }}
- **Created:** {{ $booking->created_at->format('F d, Y h:i A') }}

## Guest Details

- **Name:** {{ $booking->guest_name }}
@if($booking->guest_email)
- **Email:** {{ $booking->guest_email }}
@endif
@if($booking->guest_phone)
- **Phone:** {{ $booking->guest_phone }}
@endif
@if($booking->guest_address)
- **Address:** {{ $booking->guest_address }}
@endif

## Stay Details

- **Check-in:** {{ \Carbon\Carbon::parse($booking->check_in_date)->format('F d, Y') }}
@if($booking->check_out_date)
- **Check-out:** {{ \Carbon\Carbon::parse($booking->check_out_date)->format('F d, Y') }}
@endif
- **Booking Type:** {{ ucwords(str_replace('_', ' ', $booking->booking_type)) }}
- **Guests:** {{ $booking->total_adults }} Adults, {{ $booking->total_children }} Children

## Accommodations

@foreach($booking->accommodations as $item)
- **{{ $item->accommodation->name }}:** {{ $item->guests }} guests - ₱{{ number_format($item->subtotal, 2) }}
@endforeach

## Financial Summary

| Description | Amount |
|:------------|-------:|
| Accommodation Total | ₱{{ number_format($booking->accommodation_total, 2) }} |
| Entrance Fee Total | ₱{{ number_format($booking->entrance_fee_total, 2) }} |
| **Total Amount** | **₱{{ number_format($booking->total_amount, 2) }}** |

@if($booking->down_payment_required)
### Down Payment

| Description | Amount |
|:------------|-------:|
| Down Payment Required | ₱{{ number_format($booking->down_payment_amount, 2) }} |
| Down Payment Balance | ₱{{ number_format($booking->down_payment_balance, 2) }} |
@endif

| Description | Amount |
|:------------|-------:|
| Paid Amount | ₱{{ number_format($booking->paid_amount, 2) }} |
| **Balance** | **₱{{ number_format($booking->balance, 2) }}** |

@if($booking->notes)
## Notes

{{ $booking->notes }}
@endif

<x-mail::button :url="route('bookings.show', $booking)">
View Booking Details
</x-mail::button>

---

**Created by:** {{ $booking->createdBy->name ?? 'System' }}

This is an automated notification from {{ config('app.name') }}.
</x-mail::message>
