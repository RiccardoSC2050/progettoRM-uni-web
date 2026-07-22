package it.unibg.migration.domain;

import java.util.LinkedHashMap;
import java.util.Map;

public final class MigrationReport {
    private final boolean success;
    private final String message;
    private final String database;
    private final Map<String, Integer> imported;

    private MigrationReport(
            boolean success,
            String message,
            String database,
            Map<String, Integer> imported) {
        this.success = success;
        this.message = message;
        this.database = database;
        this.imported = imported;
    }

    public static MigrationReport success(String database, Map<String, Integer> imported) {
        return new MigrationReport(true, "Migrazione completata.", database, imported);
    }

    public static MigrationReport failure(String message) {
        return new MigrationReport(false, message, null, new LinkedHashMap<String, Integer>());
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getDatabase() {
        return database;
    }

    public Map<String, Integer> getImported() {
        return imported;
    }
}
