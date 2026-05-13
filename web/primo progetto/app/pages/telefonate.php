<?php

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../repositories/TelefonataRepository.php';

$repository = new TelefonataRepository();
$telefonate = $repository->findAll();

include __DIR__ . '/../includes/header.php';
renderView('telefonate_list', ['telefonate' => $telefonate]);
include __DIR__ . '/../includes/footer.php';
