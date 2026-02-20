<?php

namespace App\Console\Commands;

use App\Models\McpOAuthClient;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class McpCreateClient extends Command
{
    protected $signature = 'mcp:create-client {name=Claude AI}';

    protected $description = 'Create an MCP OAuth client with a client ID and secret';

    public function handle(): void
    {
        $name = $this->argument('name');
        $plainSecret = Str::random(64);

        $client = McpOAuthClient::create([
            'name' => $name,
            'secret_hash' => hash('sha256', $plainSecret),
            'redirect_uris' => [],
        ]);

        $this->newLine();
        $this->info('MCP OAuth client created successfully.');
        $this->newLine();
        $this->table(['Field', 'Value'], [
            ['Client ID', $client->id],
            ['Client Secret', $plainSecret],
            ['Name', $client->name],
        ]);
        $this->newLine();
        $this->warn('Copy the Client Secret now — it cannot be retrieved later.');
    }
}
