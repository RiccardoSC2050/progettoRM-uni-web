<?php

function getQueryString(string $key, string $default = ""): string
{
    return trim($_GET[$key] ?? $default);
}

function getQueryInt(string $key, int $default, int $min, int $max): int
{
    $value = filter_input(INPUT_GET, $key, FILTER_VALIDATE_INT);

    if ($value === false || $value === null) {
        $value = $default;
    }

    return max($min, min((int) $value, $max));
}

function getQueryIntOrNull(string $key): ?int
{
    $value = filter_input(INPUT_GET, $key, FILTER_VALIDATE_INT);
    return $value === false || $value === null ? null : (int) $value;
}

function getQueryFloat(string $key): ?float
{
    $value = filter_input(INPUT_GET, $key, FILTER_VALIDATE_FLOAT);
    return $value === false || $value === null ? null : (float) $value;
}

function getQueryDate(string $key): string
{
    $value = getQueryString($key);

    if ($value === "" || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return "";
    }

    return $value;
}

function getQueryEnum(string $key, array $allowedValues, string $default = ""): string
{
    $value = getQueryString($key, $default);
    return in_array($value, $allowedValues, true) ? $value : $default;
}

function getPagination(int $defaultLimit, int $maxLimit): array
{
    return [
        "limit" => getQueryInt("limit", $defaultLimit, 1, $maxLimit),
        "offset" => getQueryInt("offset", 0, 0, PHP_INT_MAX)
    ];
}
