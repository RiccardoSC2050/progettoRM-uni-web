<?php

require_once __DIR__ . '/../repositories/SimDisattivaRepository.php';

$id = (int) ($_POST['id'] ?? 0);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $id > 0) {
    $repository = new SimDisattivaRepository();
    $repository->update($id, $_POST);
}

header('Location: ../pages/sim_disattive.php');
exit;
