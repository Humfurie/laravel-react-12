<?php

use App\Mail\ContactSubmission;
use Illuminate\Support\Facades\Mail;

test('contact form submits successfully and sends email', function () {
    Mail::fake();

    $response = $this->post('/contact', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'I have a project idea I would like to discuss.',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    Mail::assertSent(ContactSubmission::class, function ($mail) {
        return $mail->senderName === 'John Doe'
            && $mail->senderEmail === 'john@example.com'
            && $mail->hasTo(config('mail.contact_recipient'));
    });
});

test('contact form validates required fields', function () {
    $response = $this->post('/contact', []);

    $response->assertSessionHasErrors(['name', 'email', 'message']);
});

test('contact form validates email format', function () {
    $response = $this->post('/contact', [
        'name' => 'John',
        'email' => 'not-an-email',
        'message' => 'A valid message that is long enough.',
    ]);

    $response->assertSessionHasErrors('email');
});

test('contact form validates message minimum length', function () {
    $response = $this->post('/contact', [
        'name' => 'John',
        'email' => 'john@example.com',
        'message' => 'Short',
    ]);

    $response->assertSessionHasErrors('message');
});

test('contact form validates message maximum length', function () {
    $response = $this->post('/contact', [
        'name' => 'John',
        'email' => 'john@example.com',
        'message' => str_repeat('a', 2001),
    ]);

    $response->assertSessionHasErrors('message');
});

test('contact form validates name maximum length', function () {
    $response = $this->post('/contact', [
        'name' => str_repeat('a', 101),
        'email' => 'john@example.com',
        'message' => 'A valid message that is long enough.',
    ]);

    $response->assertSessionHasErrors('name');
});

test('contact form rejects honeypot submissions', function () {
    Mail::fake();

    $response = $this->post('/contact', [
        'name' => 'Bot',
        'email' => 'bot@spam.com',
        'message' => 'Buy cheap products now!',
        'website' => 'http://spam.com', // honeypot filled = bot
    ]);

    $response->assertSessionHasErrors('website');
    Mail::assertNothingSent();
});

test('contact form strips html tags from message', function () {
    Mail::fake();

    $response = $this->post('/contact', [
        'name' => 'John',
        'email' => 'john@example.com',
        'message' => '<script>alert("xss")</script>Hello, I want to discuss a project.',
    ]);

    $response->assertRedirect();

    Mail::assertSent(ContactSubmission::class, function ($mail) {
        return $mail->senderMessage === 'alert("xss")Hello, I want to discuss a project.';
    });
});

test('contact form is rate limited', function () {
    Mail::fake();

    $payload = [
        'name' => 'John',
        'email' => 'john@example.com',
        'message' => 'A valid message for rate limit testing.',
    ];

    // Send 3 requests (the limit)
    for ($i = 0; $i < 3; $i++) {
        $this->post('/contact', $payload);
    }

    // 4th request should be throttled
    $response = $this->post('/contact', $payload);
    $response->assertStatus(429);
});
