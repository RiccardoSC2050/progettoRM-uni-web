package it.unibg.migration.application;

import it.unibg.migration.application.port.LocalImportPort;
import it.unibg.migration.application.port.RemoteExportPort;
import it.unibg.migration.domain.DatabaseName;
import it.unibg.migration.domain.ExportPage;
import it.unibg.migration.domain.MigrationReport;
import it.unibg.migration.domain.MigrationResource;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

public final class MigrationCoordinator {
    private static final int MAX_LIMIT_PER_RESOURCE = 1000;
    private static final int PROGRESS_DATA_START = 10;
    private static final int PROGRESS_DATA_END = 96;
    private static final int PROGRESS_BATCH_SIZE = 50;

    private final RemoteExportPort remote;
    private final LocalImportPort local;
    private final int pageSize;

    public MigrationCoordinator(RemoteExportPort remote, LocalImportPort local, int pageSize) {
        this.remote = remote;
        this.local = local;
        this.pageSize = pageSize;
    }

    /**
     * Migrazione completa originale. Rimane disponibile per compatibilità con
     * l'endpoint sincrono già funzionante.
     */
    public MigrationReport migrate(DatabaseName database) throws IOException {
        remote.verify();
        local.verify();
        local.prepare(database);
        Map<String, Integer> totals = new LinkedHashMap<>();
        for (MigrationResource resource : MigrationResource.ordered()) {
            totals.put(resource.externalName(), migrateAll(database, resource));
        }
        return MigrationReport.success(database.value(), totals);
    }

    /**
     * Migrazione compatta usata dall'interfaccia web. Scarica al massimo il
     * numero richiesto di righe per ogni risorsa e comunica l'avanzamento.
     */
    public MigrationReport migrateLimited(
            DatabaseName database,
            int limitPerResource,
            MigrationProgressListener listener
    ) throws IOException {
        validateLimit(limitPerResource);

        notify(listener, 1, "Controllo del servizio remoto", null, 0, 0, 0, 0, 0);
        Map<MigrationResource, Integer> remoteCounts = remote.counts();

        notify(listener, 4, "Controllo del servizio Django", null, 0, 0, 0, 0, 0);
        local.verify();

        notify(listener, 7, "Creazione del database PostgreSQL", null, 0, 0, 0, 0, 0);
        local.prepare(database);

        Map<MigrationResource, Integer> targets = targets(remoteCounts, limitPerResource);
        int targetTotal = sumTargets(targets);
        int downloadedTotal = 0;
        Map<String, Integer> importedTotals = new LinkedHashMap<>();

        for (MigrationResource resource : MigrationResource.ordered()) {
            int target = targets.get(resource);
            ResourceResult result = migrateLimitedResource(
                    database,
                    resource,
                    target,
                    downloadedTotal,
                    targetTotal,
                    listener
            );
            downloadedTotal += result.downloaded;
            importedTotals.put(resource.externalName(), result.imported);
        }

        notify(
                listener,
                99,
                "Finalizzazione dell'importazione",
                null,
                0,
                0,
                0,
                downloadedTotal,
                targetTotal
        );
        MigrationReport report = MigrationReport.success(database.value(), importedTotals);
        notify(
                listener,
                100,
                "Importazione completata",
                null,
                0,
                0,
                0,
                downloadedTotal,
                targetTotal
        );
        return report;
    }

    private int migrateAll(DatabaseName database, MigrationResource resource) throws IOException {
        int offset = 0;
        int total = 0;
        while (true) {
            ExportPage page = remote.load(resource, pageSize, offset);
            int imported = local.save(database, resource, page.payload());
            total += imported;
            if (!page.hasNext() || page.recordCount() == 0) {
                return total;
            }
            offset = page.nextOffset();
        }
    }

    private ResourceResult migrateLimitedResource(
            DatabaseName database,
            MigrationResource resource,
            int target,
            int alreadyDownloaded,
            int targetTotal,
            MigrationProgressListener listener
    ) throws IOException {
        if (target <= 0) {
            notify(
                    listener,
                    percentage(alreadyDownloaded, targetTotal),
                    "Nessun dato disponibile",
                    resource.externalName(),
                    0,
                    0,
                    0,
                    alreadyDownloaded,
                    targetTotal
            );
            return new ResourceResult(0, 0);
        }

        int offset = 0;
        int downloaded = 0;
        int imported = 0;
        int batchSize = Math.max(1, Math.min(PROGRESS_BATCH_SIZE, pageSize));

        while (downloaded < target) {
            int requestSize = Math.min(batchSize, target - downloaded);
            notify(
                    listener,
                    percentage(alreadyDownloaded + downloaded, targetTotal),
                    "Download dal servizio remoto",
                    resource.externalName(),
                    downloaded,
                    imported,
                    target,
                    alreadyDownloaded + downloaded,
                    targetTotal
            );

            ExportPage page = remote.load(resource, requestSize, offset);
            if (page.recordCount() == 0) {
                break;
            }

            int saved = local.save(database, resource, page.payload());
            downloaded += page.recordCount();
            imported += saved;
            offset = page.nextOffset();

            notify(
                    listener,
                    percentage(alreadyDownloaded + downloaded, targetTotal),
                    "Salvataggio in PostgreSQL",
                    resource.externalName(),
                    downloaded,
                    imported,
                    target,
                    alreadyDownloaded + downloaded,
                    targetTotal
            );

            if (!page.hasNext()) {
                break;
            }
        }

        return new ResourceResult(downloaded, imported);
    }

    private Map<MigrationResource, Integer> targets(
            Map<MigrationResource, Integer> remoteCounts,
            int limitPerResource
    ) {
        Map<MigrationResource, Integer> result = new LinkedHashMap<>();
        for (MigrationResource resource : MigrationResource.ordered()) {
            Integer count = remoteCounts.get(resource);
            int available = count == null ? 0 : Math.max(0, count);
            result.put(resource, Math.min(available, limitPerResource));
        }
        return result;
    }

    private int sumTargets(Map<MigrationResource, Integer> targets) {
        int total = 0;
        for (Integer value : targets.values()) {
            total += value == null ? 0 : value;
        }
        return total;
    }

    private int percentage(int downloaded, int targetTotal) {
        if (targetTotal <= 0) {
            return PROGRESS_DATA_END;
        }
        double ratio = Math.min(1.0d, Math.max(0.0d, (double) downloaded / (double) targetTotal));
        return PROGRESS_DATA_START
                + (int) Math.round(ratio * (PROGRESS_DATA_END - PROGRESS_DATA_START));
    }

    private void validateLimit(int limit) {
        if (limit < 1 || limit > MAX_LIMIT_PER_RESOURCE) {
            throw new IllegalArgumentException(
                    "Il limite per tabella deve essere compreso tra 1 e "
                            + MAX_LIMIT_PER_RESOURCE + "."
            );
        }
    }

    private void notify(
            MigrationProgressListener listener,
            int percentage,
            String phase,
            String resource,
            int downloadedCurrent,
            int importedCurrent,
            int targetCurrent,
            int downloadedTotal,
            int targetTotal
    ) {
        if (listener != null) {
            listener.onProgress(
                    percentage,
                    phase,
                    resource,
                    downloadedCurrent,
                    importedCurrent,
                    targetCurrent,
                    downloadedTotal,
                    targetTotal
            );
        }
    }

    private static final class ResourceResult {
        private final int downloaded;
        private final int imported;

        private ResourceResult(int downloaded, int imported) {
            this.downloaded = downloaded;
            this.imported = imported;
        }
    }
}
