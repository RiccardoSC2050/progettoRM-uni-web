package it.unibg.migration.application;

import java.util.LinkedHashMap;
import java.util.Map;

public final class MigrationJobSnapshot {
    private final String jobId;
    private final String status;
    private final int percentage;
    private final String phase;
    private final String resource;
    private final String message;
    private final String database;
    private final int limitPerResource;
    private final int downloadedCurrent;
    private final int importedCurrent;
    private final int targetCurrent;
    private final int downloadedTotal;
    private final int targetTotal;
    private final Map<String, Integer> downloaded;
    private final Map<String, Integer> imported;
    private final Map<String, Integer> skipped;

    public MigrationJobSnapshot(
            String jobId,
            String status,
            int percentage,
            String phase,
            String resource,
            String message,
            String database,
            int limitPerResource,
            int downloadedCurrent,
            int importedCurrent,
            int targetCurrent,
            int downloadedTotal,
            int targetTotal,
            Map<String, Integer> downloaded,
            Map<String, Integer> imported
    ) {
        this.jobId = jobId;
        this.status = status;
        this.percentage = percentage;
        this.phase = phase;
        this.resource = resource;
        this.message = message;
        this.database = database;
        this.limitPerResource = limitPerResource;
        this.downloadedCurrent = downloadedCurrent;
        this.importedCurrent = importedCurrent;
        this.targetCurrent = targetCurrent;
        this.downloadedTotal = downloadedTotal;
        this.targetTotal = targetTotal;
        this.downloaded = new LinkedHashMap<>(downloaded);
        this.imported = new LinkedHashMap<>(imported);
        this.skipped = skipped(this.downloaded, this.imported);
    }

    public String getJobId() {
        return jobId;
    }

    public String getStatus() {
        return status;
    }

    public int getPercentage() {
        return percentage;
    }

    public String getPhase() {
        return phase;
    }

    public String getResource() {
        return resource;
    }

    public String getMessage() {
        return message;
    }

    public String getDatabase() {
        return database;
    }

    public int getLimitPerResource() {
        return limitPerResource;
    }

    public int getDownloadedCurrent() {
        return downloadedCurrent;
    }

    public int getImportedCurrent() {
        return importedCurrent;
    }

    public int getTargetCurrent() {
        return targetCurrent;
    }

    public int getDownloadedTotal() {
        return downloadedTotal;
    }

    public int getTargetTotal() {
        return targetTotal;
    }

    public Map<String, Integer> getDownloaded() {
        return new LinkedHashMap<>(downloaded);
    }

    public Map<String, Integer> getImported() {
        return new LinkedHashMap<>(imported);
    }

    public Map<String, Integer> getSkipped() {
        return new LinkedHashMap<>(skipped);
    }

    private static Map<String, Integer> skipped(
            Map<String, Integer> downloaded,
            Map<String, Integer> imported
    ) {
        Map<String, Integer> values = new LinkedHashMap<>();
        for (Map.Entry<String, Integer> entry : downloaded.entrySet()) {
            int received = entry.getValue() == null ? 0 : entry.getValue();
            Integer savedValue = imported.get(entry.getKey());
            int saved = savedValue == null ? 0 : savedValue;
            values.put(entry.getKey(), Math.max(0, received - saved));
        }
        return values;
    }
}
