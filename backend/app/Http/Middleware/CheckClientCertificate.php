<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckClientCertificate
{
    public function handle(Request $request, Closure $next): Response
    {
        $cert = $request->server('SSL_CLIENT_CERT');

        if (!$cert) {
            abort(403, 'Certificato client mancante.');
        }

        $parsed = openssl_x509_parse($cert);
        $clientCN = $parsed['subject']['CN'] ?? null;

        $allowedCNs = ['client-windows', 'client-macos']; 

        if (!in_array($clientCN, $allowedCNs)) {
            abort(403, 'Accesso negato: certificato non autorizzato.');
        }

        return $next($request);
    }
}
