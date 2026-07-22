package it.unibg.migration.application.port;

import it.unibg.migration.domain.ExportPage;
import it.unibg.migration.domain.MigrationResource;

import java.io.IOException;
import java.util.Map;

public interface RemoteExportPort {
    void verify() throws IOException;
    Map<MigrationResource, Integer> counts() throws IOException;
    ExportPage load(MigrationResource resource, int limit, int offset) throws IOException;
}
