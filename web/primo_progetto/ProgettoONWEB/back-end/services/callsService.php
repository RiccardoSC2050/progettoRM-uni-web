<?php

require_once __DIR__ . "/../repositories/callsRepository.php";

function getCallsSummaryData(mysqli $conn, ?int $year, string $mode): array
{
    $selectedYear = $year ?: fetchLatestCallYear($conn);
    return fetchCallsSummary($conn, $selectedYear, $mode);
}

function getCallsData(mysqli $conn, array $filters): array
{
    return fetchCalls($conn, $filters);
}
