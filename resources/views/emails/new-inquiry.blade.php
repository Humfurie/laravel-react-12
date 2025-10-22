<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Property Inquiry</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
        }
        .content {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-top: none;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .property-title {
            font-size: 20px;
            font-weight: bold;
            color: #f97316;
            margin-bottom: 20px;
        }
        .info-row {
            margin: 15px 0;
            padding: 10px;
            background: #f9fafb;
            border-radius: 4px;
        }
        .label {
            font-weight: 600;
            color: #6b7280;
            display: inline-block;
            width: 150px;
        }
        .value {
            color: #111827;
        }
        .message-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #f97316;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 24px;">New Property Inquiry</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">You have received a new inquiry</p>
    </div>

    <div class="content">
        <div class="property-title">
            Property: {{ $inquiry->property->title }}
        </div>

        <div class="info-row">
            <span class="label">Customer Name:</span>
            <span class="value">{{ $inquiry->customer_name }}</span>
        </div>

        <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">{{ $inquiry->customer_email }}</span>
        </div>

        @if($inquiry->customer_phone)
        <div class="info-row">
            <span class="label">Phone:</span>
            <span class="value">{{ $inquiry->customer_phone }}</span>
        </div>
        @endif

        @if($inquiry->inquiry_type)
        <div class="info-row">
            <span class="label">Inquiry Type:</span>
            <span class="value">{{ ucwords(str_replace('_', ' ', $inquiry->inquiry_type)) }}</span>
        </div>
        @endif

        @if($inquiry->preferred_contact_time)
        <div class="info-row">
            <span class="label">Preferred Contact Time:</span>
            <span class="value">{{ $inquiry->preferred_contact_time }}</span>
        </div>
        @endif

        @if($inquiry->message)
        <div class="message-box">
            <strong>Message:</strong><br>
            {{ $inquiry->message }}
        </div>
        @endif

        <div style="text-align: center;">
            <a href="{{ config('app.url') }}/admin/real-estate?tab=inquiries" class="button">
                View Inquiry in Admin Panel
            </a>
        </div>

        <div class="footer">
            <p>This inquiry was submitted on {{ $inquiry->created_at->format('F j, Y \a\t g:i A') }}</p>
            <p style="margin-top: 10px;">
                <small>Please respond to the customer as soon as possible to provide excellent service.</small>
            </p>
        </div>
    </div>
</body>
</html>
