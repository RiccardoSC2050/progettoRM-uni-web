<?php

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../repositories/ContrattoRepository.php';

$id = (int) ($_GET['id'] ?? 0);
$repository = new ContrattoRepository();
$contratto = $repository->findById($id);

include __DIR__ . '/../includes/header.php';
renderView('contratto_dettaglio', ['contratto' => $contratto]);
include __DIR__ . '/../includes/footer.php';
