<?php

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../repositories/SimDisattivaRepository.php';

$repository = new SimDisattivaRepository();
$simDisattive = $repository->findAll();

include __DIR__ . '/../includes/header.php';
renderView('sim_disattive_list', ['simDisattive' => $simDisattive]);
include __DIR__ . '/../includes/footer.php';
