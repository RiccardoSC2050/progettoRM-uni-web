package it.unibg.migration.application;

import it.unibg.migration.application.port.LocalImportPort;
import it.unibg.migration.application.port.RemoteExportPort;
import it.unibg.migration.domain.DatabaseName;
import it.unibg.migration.domain.ExportPage;
import it.unibg.migration.domain.MigrationResource;

import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Esegue la migrazione delle singole risorse.
 *
 * I contratti costituiscono la radice del campione. Le risorse dipendenti
 * vengono analizzate integralmente e filtrate in base ai contratti scelti,
 * così non vengono più importate righe scollegate.
 */
public final class ResourceMigrationService {
    private static final int PROGRESS_BATCH_SIZE = 50;

    private final RemoteExportPort remote;
    private final LocalImportPort local;
    private final int configuredPageSize;

    public ResourceMigrationService(RemoteExportPort remote, LocalImportPort local, int configuredPageSize) {
        this.remote = remote;
        this.local = local;
        this.configuredPageSize = configuredPageSize;
    }

    public ContractImportResult importContracts(
            DatabaseName database,
            int contractLimit,
            MigrationProgressTracker progress
    ) throws IOException {
        MigrationResource resource = MigrationResource.CONTRATTI;
        int offset = 0;
        int scanned = 0;
        int imported = 0;
        Set<String> selectedContracts = new LinkedHashSet<>();
        int batchSize = batchSize();

        while (scanned < contractLimit) {
            int requestSize = Math.min(batchSize, contractLimit - scanned);
            progress.resource("Selezione dei contratti", resource, scanned, imported, contractLimit);

            ExportPage page = remote.load(resource, requestSize, offset);
            if (page.recordCount() == 0) {
                break;
            }

            selectedContracts.addAll(ExportPayload.contractNumbers(page, resource));
            imported += local.save(database, resource, page.payload());
            scanned += page.recordCount();
            offset = page.nextOffset();

            progress.resource("Salvataggio dei contratti", resource, scanned, imported, contractLimit);
            if (!page.hasNext()) {
                break;
            }
        }

        progress.completeResource(scanned);
        return new ContractImportResult(selectedContracts, scanned, imported);
    }

    public ResourceImportResult importRelated(
            DatabaseName database,
            MigrationResource resource,
            Set<String> selectedContracts,
            int availableRows,
            MigrationProgressTracker progress
    ) throws IOException {
        if (!resource.isRelatedToContract()) {
            throw new IllegalArgumentException("La risorsa non dipende dai contratti: " + resource.externalName());
        }

        int offset = 0;
        int scanned = 0;
        int imported = 0;
        int batchSize = Math.max(batchSize(), Math.min(configuredPageSize, 500));

        while (true) {
            progress.resource(
                    "Ricerca dei dati collegati",
                    resource,
                    scanned,
                    imported,
                    availableRows
            );

            ExportPage page = remote.load(resource, batchSize, offset);
            if (page.recordCount() == 0) {
                break;
            }

            ExportPayload.FilteredPayload filtered = ExportPayload.relatedTo(
                    page,
                    resource,
                    selectedContracts
            );
            if (filtered.recordCount() > 0) {
                imported += local.save(database, resource, filtered.payload());
            }

            scanned += page.recordCount();
            offset = page.nextOffset();
            progress.resource(
                    "Salvataggio dei dati collegati",
                    resource,
                    scanned,
                    imported,
                    availableRows
            );

            if (!page.hasNext()) {
                break;
            }
        }

        progress.completeResource(scanned);
        return new ResourceImportResult(scanned, imported);
    }

    private int batchSize() {
        return Math.max(1, Math.min(PROGRESS_BATCH_SIZE, configuredPageSize));
    }

    public static class ResourceImportResult {
        private final int scanned;
        private final int imported;

        public ResourceImportResult(int scanned, int imported) {
            this.scanned = scanned;
            this.imported = imported;
        }

        public int scanned() {
            return scanned;
        }

        public int imported() {
            return imported;
        }
    }

    public static final class ContractImportResult extends ResourceImportResult {
        private final Set<String> contractNumbers;

        public ContractImportResult(Set<String> contractNumbers, int scanned, int imported) {
            super(scanned, imported);
            this.contractNumbers = new LinkedHashSet<>(contractNumbers);
        }

        public Set<String> contractNumbers() {
            return new LinkedHashSet<>(contractNumbers);
        }
    }
}
