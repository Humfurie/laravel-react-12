<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Mail\ContactSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(StoreContactRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Mail::to(config('mail.contact_recipient', 'contact@humfurie.org'))
            ->send(new ContactSubmission(
                senderName: $validated['name'],
                senderEmail: $validated['email'],
                senderMessage: $validated['message'],
            ));

        return back()->with('success', 'Thanks for reaching out! I\'ll get back to you soon.');
    }
}
