<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authorize {{ $client->name }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 2rem; max-width: 420px; width: 100%; }
        h1 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
        .description { color: #94a3b8; font-size: 0.875rem; margin-bottom: 1.5rem; line-height: 1.5; }
        .client-name { color: #38bdf8; font-weight: 600; }
        .permissions { background: #0f172a; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; font-size: 0.875rem; }
        .permissions li { margin-left: 1rem; margin-bottom: 0.25rem; color: #cbd5e1; }
        .actions { display: flex; gap: 0.75rem; }
        button, a.deny { display: inline-flex; align-items: center; justify-content: center; padding: 0.625rem 1.25rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; text-decoration: none; cursor: pointer; border: none; flex: 1; }
        button[type="submit"] { background: #2563eb; color: white; }
        button[type="submit"]:hover { background: #1d4ed8; }
        a.deny { background: #334155; color: #94a3b8; }
        a.deny:hover { background: #475569; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Authorization Request</h1>
        <p class="description">
            <span class="client-name">{{ $client->name }}</span> is requesting access to your portfolio MCP server. This will allow it to read and manage your content.
        </p>
        <ul class="permissions">
            <li>Read and write blog posts, projects, deployments</li>
            <li>Manage experiences and expertise</li>
            <li>Moderate guestbook entries and comments</li>
            <li>View dashboard statistics</li>
        </ul>
        <div class="actions">
            <form method="POST" action="{{ url('/oauth/authorize') }}" style="flex:1;display:flex;">
                @csrf
                <input type="hidden" name="client_id" value="{{ $client->id }}">
                <input type="hidden" name="redirect_uri" value="{{ $redirect_uri }}">
                <input type="hidden" name="code_challenge" value="{{ $code_challenge }}">
                <input type="hidden" name="code_challenge_method" value="{{ $code_challenge_method }}">
                <input type="hidden" name="state" value="{{ $state }}">
                <button type="submit" style="flex:1;">Authorize</button>
            </form>
            <a class="deny" href="{{ $redirect_uri }}?error=access_denied&state={{ $state }}">Deny</a>
        </div>
    </div>
</body>
</html>
