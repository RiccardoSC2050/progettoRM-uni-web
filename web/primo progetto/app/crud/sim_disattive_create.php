<?php

require_once __DIR__ . '/../repositories/SimDisattivaRepository.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $repository = new SimDisattivaRepository();
    $repository->create($_POST);
}

header('Location: ../pages/sim_disattive.php');
exit;
