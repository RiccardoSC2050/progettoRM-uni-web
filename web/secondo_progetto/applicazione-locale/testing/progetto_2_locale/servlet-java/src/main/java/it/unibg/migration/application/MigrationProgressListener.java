package it.unibg.migration.application;

public interface MigrationProgressListener {
    void onProgress(
            int percentage,
            String phase,
            String resource,
            int downloadedCurrent,
            int importedCurrent,
            int targetCurrent,
            int downloadedTotal,
            int targetTotal
    );
}
