<?php

$config = appConfig();
?>
<!doctype html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($config['app_name']) ?></title>
    <link rel="stylesheet" href="<?= e($config['base_url']) ?>css/style.css">
</head>
<body>
    <header class="site-header">
        <div class="container">
            <a class="brand" href="<?= e($config['base_url']) ?>index.php"><?= e($config['app_name']) ?></a>
            <nav class="site-nav">
                <a href="<?= e($config['base_url']) ?>pages/contratti.php">Contratti</a>
                <a href="<?= e($config['base_url']) ?>pages/telefonate.php">Telefonate</a>
                <a href="<?= e($config['base_url']) ?>pages/sim_attive.php">SIM attive</a>
                <a href="<?= e($config['base_url']) ?>pages/sim_disattive.php">SIM disattive</a>
                <a href="<?= e($config['base_url']) ?>pages/sim_non_attive.php">SIM non attive</a>
            </nav>
        </div>
    </header>
    <main class="container">
