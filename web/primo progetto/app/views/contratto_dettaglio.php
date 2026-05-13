<section>
    <h1>Dettaglio contratto</h1>
    <?php if (!$contratto): ?>
        <p>Contratto non trovato.</p>
    <?php else: ?>
        <pre><?= e(print_r($contratto, true)) ?></pre>
    <?php endif; ?>
</section>
