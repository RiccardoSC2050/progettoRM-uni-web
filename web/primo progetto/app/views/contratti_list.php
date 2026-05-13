<section>
    <h1>Contratti</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Dettaglio</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($contratti as $contratto): ?>
                <tr>
                    <td><?= e((string) ($contratto['id'] ?? '')) ?></td>
                    <td>
                        <a href="contratto_dettaglio.php?id=<?= e((string) ($contratto['id'] ?? '0')) ?>">
                            Apri
                        </a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</section>
