package it.unibg.migration.application;

import it.unibg.migration.domain.MigrationResource;

/** Calcola e pubblica un avanzamento coerente sull'intero piano di migrazione. */
public final class MigrationProgressTracker {
    private static final int DATA_START = 10;
    private static final int DATA_END = 96;

    private final MigrationProgressListener listener;
    private final int targetTotal;
    private int completedWork;

    public MigrationProgressTracker(MigrationProgressListener listener, int targetTotal) {
        this.listener = listener;
        this.targetTotal = Math.max(0, targetTotal);
    }

    public void status(int percentage, String phase) {
        notifyListener(percentage, phase, null, 0, 0, 0, completedWork);
    }

    public void resource(
            String phase,
            MigrationResource resource,
            int currentScanned,
            int currentImported,
            int currentTarget
    ) {
        notifyListener(
                percentage(completedWork + currentScanned),
                phase,
                resource,
                currentScanned,
                currentImported,
                currentTarget,
                completedWork + currentScanned
        );
    }

    public void completeResource(int workDone) {
        completedWork += Math.max(0, workDone);
    }

    public int completedWork() {
        return completedWork;
    }

    public int targetTotal() {
        return targetTotal;
    }

    private int percentage(int workDone) {
        if (targetTotal <= 0) {
            return DATA_END;
        }
        double ratio = Math.min(1.0d, Math.max(0.0d, (double) workDone / (double) targetTotal));
        return DATA_START + (int) Math.round(ratio * (DATA_END - DATA_START));
    }

    private void notifyListener(
            int percentage,
            String phase,
            MigrationResource resource,
            int scannedCurrent,
            int importedCurrent,
            int targetCurrent,
            int scannedTotal
    ) {
        if (listener == null) {
            return;
        }
        listener.onProgress(
                percentage,
                phase,
                resource == null ? null : resource.externalName(),
                scannedCurrent,
                importedCurrent,
                targetCurrent,
                scannedTotal,
                targetTotal
        );
    }
}
