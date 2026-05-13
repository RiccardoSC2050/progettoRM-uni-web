<?php

require_once __DIR__ . '/../repositories/SimDisattivaRepository.php';

$id = (int) ($_POST['id'] ?? $_GET['id'] ?? 0);

if ($id > 0) {
    $repository = new SimDisattivaRepository();
    $repository->delete($id);
}

header('Location: ../pages/sim_disattive.php');
exit;
