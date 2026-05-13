<section>
    <h1>SIM attive</h1>
    <table class="data-table">
        <thead>
            <tr>
                <th>Record</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($simAttive as $sim): ?>
                <tr>
                    <td><?= e(json_encode($sim, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '') ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</section>
