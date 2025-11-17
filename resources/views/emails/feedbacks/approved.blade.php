<x-mail::message>
# Your Feedback Has Been Approved

Dear **{{ $feedback->guest_name }}**,

Thank you for sharing your feedback with us! Your review has been approved and is now visible to other guests.

## Your Feedback

**Rating:** @for($i = 0; $i < $feedback->rating; $i++)⭐@endfor ({{ $feedback->rating }}/5)

@if($feedback->comment)
**Comment:**
> {{ $feedback->comment }}
@endif

@if($feedback->booking)
**Related Booking:** {{ $feedback->booking->booking_number }}
@endif

<x-mail::button :url="route('feedbacks.show', $feedback)">
View Your Feedback
</x-mail::button>

We appreciate you taking the time to share your experience!

Best regards,<br>
{{ config('app.name') }}
</x-mail::message>
