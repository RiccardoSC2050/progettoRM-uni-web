<?php

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../repositories/ContrattoRepository.php';

$repository = new ContrattoRepository();
$contratti = $repository->findAll();

include __DIR__ . '/../includes/header.php';
renderView('contratti_list', ['contratti' => $contratti]);
include __DIR__ . '/../includes/footer.php';
