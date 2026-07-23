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
import java.util.Set;

/** Coordina il piano di migrazione senza contenere la logica delle singole risorse. */
public final class MigrationCoordinator {
    private static final int MAX_CONTRACT_LIMIT = 1000;

    private final RemoteExportPort remote;
    private final LocalImportPort local;
    private final int pageSize;
    private final ResourceMigrationService resourceMigration;

    public MigrationCoordinator(RemoteExportPort remote, LocalImportPort local, int pageSize) {
        this.remote = remote;
        this.local = local;
        this.pageSize = pageSize;
        this.resourceMigration = new ResourceMigrationService(remote, local, pageSize);
    }

    /** Migrazione completa mantenuta per compatibilità con l'endpoint sincrono. */
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
     * Importa un numero massimo di contratti e tutti i dati remoti collegati a
     * quei contratti. Le risorse prive di una relazione con il contratto non
     * fanno parte di questa importazione relazionale.
     */
    public MigrationReport migrateLimited(
            DatabaseName database,
            int contractLimit,
            MigrationProgressListener listener
    ) throws IOException {
        validateContractLimit(contractLimit);

        preliminary(listener, 1, "Controllo del servizio remoto");
        Map<MigrationResource, Integer> remoteCounts = remote.counts();

        preliminary(listener, 4, "Controllo del servizio Django");
        local.verify();

        preliminary(listener, 7, "Creazione del database PostgreSQL");
        local.prepare(database);

        int contractTarget = limitedCount(remoteCounts, MigrationResource.CONTRATTI, contractLimit);
        int relatedWork = contractTarget > 0 ? relatedWork(remoteCounts) : 0;
        int targetTotal = contractTarget + relatedWork;

        MigrationProgressTracker progress = new MigrationProgressTracker(listener, targetTotal);
        Map<String, Integer> importedTotals = new LinkedHashMap<>();

        ResourceMigrationService.ContractImportResult contracts = resourceMigration.importContracts(
                database,
                contractTarget,
                progress
        );
        importedTotals.put(MigrationResource.CONTRATTI.externalName(), contracts.imported());
        Set<String> selectedContracts = contracts.contractNumbers();

        for (MigrationResource resource : MigrationResource.relatedResources()) {
            int available = count(remoteCounts, resource);
            ResourceMigrationService.ResourceImportResult result;
            if (selectedContracts.isEmpty()) {
                result = new ResourceMigrationService.ResourceImportResult(0, 0);
            } else {
                result = resourceMigration.importRelated(
                        database,
                        resource,
                        selectedContracts,
                        available,
                        progress
                );
            }
            importedTotals.put(resource.externalName(), result.imported());
        }

        progress.status(99, "Finalizzazione dell'importazione");
        MigrationReport report = MigrationReport.success(database.value(), importedTotals);
        progress.status(100, "Importazione completata");
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

    private int relatedWork(Map<MigrationResource, Integer> counts) {
        int total = 0;
        for (MigrationResource resource : MigrationResource.relatedResources()) {
            total += count(counts, resource);
        }
        return total;
    }

    private int limitedCount(
            Map<MigrationResource, Integer> counts,
            MigrationResource resource,
            int limit
    ) {
        return Math.min(count(counts, resource), limit);
    }

    private int count(Map<MigrationResource, Integer> counts, MigrationResource resource) {
        Integer value = counts.get(resource);
        return value == null ? 0 : Math.max(0, value);
    }

    private void validateContractLimit(int limit) {
        if (limit < 1 || limit > MAX_CONTRACT_LIMIT) {
            throw new IllegalArgumentException(
                    "Il numero di contratti deve essere compreso tra 1 e " + MAX_CONTRACT_LIMIT + "."
            );
        }
    }

    private void preliminary(
            MigrationProgressListener listener,
            int percentage,
            String phase
    ) {
        if (listener != null) {
            listener.onProgress(percentage, phase, null, 0, 0, 0, 0, 0);
        }
    }
}
