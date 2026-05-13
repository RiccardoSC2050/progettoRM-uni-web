<?php

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../repositories/SimNonAttivaRepository.php';

$repository = new SimNonAttivaRepository();
$simNonAttive = $repository->findAll();

include __DIR__ . '/../includes/header.php';
renderView('sim_non_attive_list', ['simNonAttive' => $simNonAttive]);
include __DIR__ . '/../includes/footer.php';
