<?php

require_once __DIR__ . "/../../core/response.php";
require_once __DIR__ . "/../../core/request.php";

requireMethod("GET");

sendSuccess([
    "service" => "Database migration export API",
    "version" => 1,
    "endpoints" => [
        "manifest" => "get-manifest.php",
        "export" => "export-resource.php?resource=contratti&limit=1000&offset=0"
    ],
    "resources" => [
        "contratti",
        "simAttive",
        "simDisattive",
        "simNonAttive",
        "telefonate"
    ]
]);
