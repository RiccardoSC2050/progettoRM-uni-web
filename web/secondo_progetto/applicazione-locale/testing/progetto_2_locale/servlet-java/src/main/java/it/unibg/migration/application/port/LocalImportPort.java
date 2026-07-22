package it.unibg.migration.application.port;

import com.fasterxml.jackson.databind.JsonNode;
import it.unibg.migration.domain.DatabaseName;
import it.unibg.migration.domain.MigrationResource;

import java.io.IOException;
import java.util.List;

public interface LocalImportPort {
    void verify() throws IOException;
    List<String> databases() throws IOException;
    void prepare(DatabaseName database) throws IOException;
    void delete(DatabaseName database) throws IOException;
    int save(DatabaseName database, MigrationResource resource, JsonNode payload) throws IOException;
}
