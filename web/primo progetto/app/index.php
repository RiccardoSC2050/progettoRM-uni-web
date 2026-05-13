<?php

require_once __DIR__ . '/includes/functions.php';

$sections = [
    'Contratti' => 'pages/contratti.php',
    'Telefonate' => 'pages/telefonate.php',
    'SIM attive' => 'pages/sim_attive.php',
    'SIM disattive' => 'pages/sim_disattive.php',
    'SIM non attive' => 'pages/sim_non_attive.php',
];

include __DIR__ . '/includes/header.php';
?>
<section class="hero">
    <h1>Progetto Telefonia</h1>
    <p>Architettura base pronta per integrare database, viste e logica CRUD.</p>
</section>

<section class="card-grid">
    <?php foreach ($sections as $label => $href): ?>
        <a class="card-link" href="<?= e($href) ?>">
            <span><?= e($label) ?></span>
        </a>
    <?php endforeach; ?>
</section>
<?php include __DIR__ . '/includes/footer.php'; ?>
