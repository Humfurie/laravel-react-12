<x-mail::message>
# New Contact Form Submission

**From:** {{ $senderName }}
**Email:** {{ $senderEmail }}

---

{{ $senderMessage }}

<x-mail::button :url="'mailto:' . $senderEmail">
Reply to {{ $senderName }}
</x-mail::button>

<x-slot:subcopy>
This message was sent via the contact form on {{ config('app.name') }}.
</x-slot:subcopy>
</x-mail::message>
