<?php

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../repositories/SimAttivaRepository.php';

$repository = new SimAttivaRepository();
$simAttive = $repository->findAll();

include __DIR__ . '/../includes/header.php';
renderView('sim_attive_list', ['simAttive' => $simAttive]);
include __DIR__ . '/../includes/footer.php';
