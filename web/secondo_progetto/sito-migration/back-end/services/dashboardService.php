<?php

require_once __DIR__ . "/../repositories/dashboardRepository.php";

function getDashboardSummaryData(mysqli $conn): array
{
    return fetchDashboardSummary($conn);
}
