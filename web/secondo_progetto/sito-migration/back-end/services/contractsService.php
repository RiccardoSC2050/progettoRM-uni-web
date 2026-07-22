<?php

require_once __DIR__ . "/../repositories/contractsRepository.php";

function getContractsData(mysqli $conn, array $filters): array
{
    return fetchContracts($conn, $filters);
}

function getContractDetailData(mysqli $conn, string $numero): ?array
{
    return fetchContractDetail($conn, $numero);
}

function getContractCallsData(mysqli $conn, array $filters): array
{
    return fetchContractCalls($conn, $filters);
}
