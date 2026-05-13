<?php

return [
    'app_name' => 'Progetto Telefonia',
    'base_url' => '',
    'db' => [
        'host' => '127.0.0.1',
        'port' => '3306',
        'dbname' => 'progetto_telefonia',
        'user' => 'root',
        'password' => '',
        'charset' => 'utf8mb4',
    ],
    'paths' => [
        'documentation' => realpath(__DIR__ . '/../../docs') ?: __DIR__ . '/../../docs',
        'datasets' => realpath(__DIR__ . '/../../data') ?: __DIR__ . '/../../data',
        'excel' => realpath(__DIR__ . '/../../data/excel') ?: __DIR__ . '/../../data/excel',
        'csv' => realpath(__DIR__ . '/../../data/csv') ?: __DIR__ . '/../../data/csv',
    ],
];
