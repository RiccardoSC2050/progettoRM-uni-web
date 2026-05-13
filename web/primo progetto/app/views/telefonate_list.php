<section>
    <h1>Telefonate</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th>Record</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($telefonate as $telefonata): ?>
                <tr>
                    <td><?= e(json_encode($telefonata, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '') ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</section>
