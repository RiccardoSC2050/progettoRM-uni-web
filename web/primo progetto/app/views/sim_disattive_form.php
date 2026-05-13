<section id="sim-form" class="form-card">
    <h2><?= $simRecord ? 'Modifica SIM disattiva' : 'Nuova SIM disattiva' ?></h2>
    <form action="<?= e($formAction) ?>" method="post">
        <?php if ($simRecord): ?>
            <input type="hidden" name="id" value="<?= e((string) ($simRecord['id'] ?? '0')) ?>">
        <?php endif; ?>

        <label>
            Numero
            <input
                type="text"
                name="numero"
                value="<?= e($simRecord['numero'] ?? '') ?>"
                required
            >
        </label>

        <label>
            Intestatario
            <input
                type="text"
                name="intestatario"
                value="<?= e($simRecord['intestatario'] ?? '') ?>"
            >
        </label>

        <button type="submit"><?= $simRecord ? 'Salva modifiche' : 'Crea SIM' ?></button>
    </form>
</section>
