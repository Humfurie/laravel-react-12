<?php

namespace App\Http\Controllers;

use App\Mcp\Servers\PortfolioServer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Laravel\Mcp\Server\Transport\HttpTransport;

class McpController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $transport = new HttpTransport(
            $request,
            (string) $request->header('MCP-Session-Id'),
        );

        $server = app(PortfolioServer::class, [
            'transport' => $transport,
        ]);

        $server->start();

        $result = $transport->run();

        // Ensure a clean Response for Octane/Swoole compatibility
        return new Response(
            $result->getContent(),
            $result->getStatusCode(),
            $result->headers->all(),
        );
    }
}
