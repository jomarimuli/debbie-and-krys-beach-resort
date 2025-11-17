<x-mail::message>
# New Announcement

## {{ $announcement->title }}

@if($announcement->published_at)
**Published:** {{ \Carbon\Carbon::parse($announcement->published_at)->format('F d, Y h:i A') }}
@endif

---

{!! nl2br(e($announcement->content)) !!}

---

<x-mail::button :url="route('announcements.show', $announcement)">
View Announcement
</x-mail::button>

<x-mail::subcopy>
You are receiving this email because you are a registered user of {{ config('app.name') }}.
To view all announcements, visit your [dashboard]({{ route('dashboard') }}).
</x-mail::subcopy>

Thank you,<br>
{{ config('app.name') }}
</x-mail::message>
