<?php

return [

    'paths' => ['api/*'],  // Abilita CORS solo per API

    'allowed_methods' => ['*'],  // Tutti i metodi: GET, POST, ecc.

    'allowed_origins' => ['*'],  // O il tuo dominio frontend, es: 'http://80.211.208.57'

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,  // true se usi cookie/session
];
