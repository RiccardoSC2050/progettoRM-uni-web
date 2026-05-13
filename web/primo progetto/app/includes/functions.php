<?php

function appConfig(): array
{
    static $config = null;

    if ($config === null) {
        $config = require __DIR__ . '/config.php';
    }

    return $config;
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function renderView(string $view, array $data = []): void
{
    extract($data, EXTR_SKIP);
    include __DIR__ . '/../views/' . $view . '.php';
}
