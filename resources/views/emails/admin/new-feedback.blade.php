<x-mail::message>
# New Feedback Submitted

A customer has submitted feedback.

## Feedback Details

- **Rating:** {{ $feedback->rating }}/5
- **Status:** {{ ucfirst($feedback->status) }}
- **Submitted:** {{ $feedback->created_at->format('F d, Y h:i A') }}

## Customer Information

- **Name:** {{ $feedback->guest_name }}
@if($feedback->guest_email)
- **Email:** {{ $feedback->guest_email }}
@endif
@if($feedback->guest_phone)
- **Phone:** {{ $feedback->guest_phone }}
@endif
@if($feedback->guest_address)
- **Address:** {{ $feedback->guest_address }}
@endif

@if($feedback->booking)
## Related Booking

- **Booking Number:** {{ $feedback->booking->booking_number }}
- **Check-in Date:** {{ \Carbon\Carbon::parse($feedback->booking->check_in_date)->format('F d, Y') }}
- **Booking Type:** {{ ucwords(str_replace('_', ' ', $feedback->booking->booking_type)) }}

### Accommodations Used

@foreach($feedback->booking->accommodations as $item)
- {{ $item->accommodation->name }}
@endforeach
@endif

@if($feedback->comment)
## Customer Comment

<x-mail::panel>
{{ $feedback->comment }}
</x-mail::panel>
@endif

<x-mail::button :url="route('feedbacks.show', $feedback)">
View Feedback Details
</x-mail::button>

@if($feedback->status === 'pending')
<x-mail::panel>
**Action Required:** This feedback is waiting for approval.
</x-mail::panel>
@endif

---

This is an automated notification from {{ config('app.name') }}.
</x-mail::message>
