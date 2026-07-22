package it.unibg.migration.application;

import it.unibg.migration.domain.DatabaseName;
import it.unibg.migration.domain.MigrationReport;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;

public final class MigrationJobRegistry {
    private static final MigrationJobRegistry INSTANCE = new MigrationJobRegistry();

    private final ConcurrentMap<String, Job> jobs = new ConcurrentHashMap<>();
    private final ExecutorService executor = Executors.newSingleThreadExecutor(new ThreadFactory() {
        @Override
        public Thread newThread(Runnable runnable) {
            Thread thread = new Thread(runnable, "migration-import-worker");
            thread.setDaemon(true);
            return thread;
        }
    });

    private MigrationJobRegistry() {
    }

    public static MigrationJobRegistry instance() {
        return INSTANCE;
    }

    public synchronized MigrationJobSnapshot start(
            final MigrationCoordinator coordinator,
            final DatabaseName database,
            final int limitPerResource
    ) {
        if (hasActiveJob()) {
            throw new IllegalStateException(
                    "È già in corso un'importazione. Attendere il completamento prima di avviarne un'altra."
            );
        }

        final String jobId = UUID.randomUUID().toString();
        final Job job = new Job(jobId, database.value(), limitPerResource);
        jobs.put(jobId, job);
        trimCompletedJobs();

        executor.submit(new Runnable() {
            @Override
            public void run() {
                job.running();
                try {
                    MigrationReport report = coordinator.migrateLimited(
                            database,
                            limitPerResource,
                            new MigrationProgressListener() {
                                @Override
                                public void onProgress(
                                        int percentage,
                                        String phase,
                                        String resource,
                                        int downloadedCurrent,
                                        int importedCurrent,
                                        int targetCurrent,
                                        int downloadedTotal,
                                        int targetTotal
                                ) {
                                    job.progress(
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
                    );
                    job.completed(report);
                } catch (Exception exception) {
                    String message = exception.getMessage();
                    job.failed(
                            message == null || message.trim().isEmpty()
                                    ? exception.getClass().getSimpleName()
                                    : message
                    );
                }
            }
        });

        return job.snapshot();
    }

    public MigrationJobSnapshot get(String jobId) {
        Job job = jobs.get(jobId);
        return job == null ? null : job.snapshot();
    }

    private boolean hasActiveJob() {
        for (Job job : jobs.values()) {
            if (job.active()) {
                return true;
            }
        }
        return false;
    }

    private void trimCompletedJobs() {
        if (jobs.size() <= 30) {
            return;
        }
        for (Map.Entry<String, Job> entry : jobs.entrySet()) {
            if (!entry.getValue().active() && jobs.size() > 20) {
                jobs.remove(entry.getKey());
            }
        }
    }

    private static final class Job {
        private final String jobId;
        private final String database;
        private final int limitPerResource;
        private String status = "queued";
        private int percentage;
        private String phase = "Importazione in coda";
        private String resource;
        private String message = "Preparazione dell'importazione.";
        private int downloadedCurrent;
        private int importedCurrent;
        private int targetCurrent;
        private int downloadedTotal;
        private int targetTotal;
        private final Map<String, Integer> downloaded = new LinkedHashMap<>();
        private final Map<String, Integer> imported = new LinkedHashMap<>();

        private Job(String jobId, String database, int limitPerResource) {
            this.jobId = jobId;
            this.database = database;
            this.limitPerResource = limitPerResource;
        }

        private synchronized boolean active() {
            return "queued".equals(status) || "running".equals(status);
        }

        private synchronized void running() {
            status = "running";
            percentage = 1;
            phase = "Avvio dell'importazione";
            message = "Processo avviato.";
        }

        private synchronized void progress(
                int percentage,
                String phase,
                String resource,
                int downloadedCurrent,
                int importedCurrent,
                int targetCurrent,
                int downloadedTotal,
                int targetTotal
        ) {
            status = "running";
            this.percentage = Math.max(this.percentage, Math.min(99, percentage));
            this.phase = phase;
            this.resource = resource;
            this.downloadedCurrent = downloadedCurrent;
            this.importedCurrent = importedCurrent;
            this.targetCurrent = targetCurrent;
            this.downloadedTotal = downloadedTotal;
            this.targetTotal = targetTotal;
            this.message = resource == null ? phase : phase + ": " + resource;
            if (resource != null) {
                downloaded.put(resource, downloadedCurrent);
                imported.put(resource, importedCurrent);
            }
        }

        private synchronized void completed(MigrationReport report) {
            status = "completed";
            percentage = 100;
            phase = "Importazione completata";
            resource = null;
            downloadedCurrent = 0;
            importedCurrent = 0;
            targetCurrent = 0;
            message = report.getMessage();
            imported.clear();
            imported.putAll(report.getImported());
        }

        private synchronized void failed(String error) {
            status = "failed";
            phase = "Importazione interrotta";
            message = error;
        }

        private synchronized MigrationJobSnapshot snapshot() {
            return new MigrationJobSnapshot(
                    jobId,
                    status,
                    percentage,
                    phase,
                    resource,
                    message,
                    database,
                    limitPerResource,
                    downloadedCurrent,
                    importedCurrent,
                    targetCurrent,
                    downloadedTotal,
                    targetTotal,
                    downloaded,
                    imported
            );
        }
    }
}
