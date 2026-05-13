<section>
    <div class="section-header">
        <h1>SIM disattive</h1>
        <a class="button" href="#sim-form">Nuova SIM disattiva</a>
    </div>

    <?php
    $formAction = '../crud/sim_disattive_create.php';
    $simRecord = null;
    include __DIR__ . '/sim_disattive_form.php';
    ?>

    <table class="data-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Numero</th>
                <th>Intestatario</th>
                <th>Azioni</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($simDisattive as $sim): ?>
                <tr>
                    <td><?= e((string) ($sim['id'] ?? '')) ?></td>
                    <td><?= e($sim['numero'] ?? '') ?></td>
                    <td><?= e($sim['intestatario'] ?? '') ?></td>
                    <td class="actions">
                        <form action="../crud/sim_disattive_delete.php" method="post">
                            <input type="hidden" name="id" value="<?= e((string) ($sim['id'] ?? '0')) ?>">
                            <button type="submit">Elimina</button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</section>
