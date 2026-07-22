package it.unibg.migration.infrastructure.gateway;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import it.unibg.migration.application.port.RemoteExportPort;
import it.unibg.migration.domain.ExportPage;
import it.unibg.migration.domain.MigrationResource;
import it.unibg.migration.infrastructure.http.JsonHttpClient;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/** Adapter HTTP verso le API PHP del Progetto 1 su Altervista. */
public final class PhpExportGateway implements RemoteExportPort {
    private final JsonHttpClient client;
    private final ObjectMapper mapper;
    private final String baseUrl;

    public PhpExportGateway(JsonHttpClient client, ObjectMapper mapper, String baseUrl) {
        this.client = client;
        this.mapper = mapper;
        this.baseUrl = baseUrl;
    }

    @Override
    public void verify() throws IOException {
        readManifest();
    }

    @Override
    public Map<MigrationResource, Integer> counts() throws IOException {
        JsonNode resources = readManifest().path("data").path("resources");
        if (!resources.isObject()) {
            throw new IOException("Il manifest remoto non contiene i conteggi delle risorse.");
        }

        Map<MigrationResource, Integer> values = new LinkedHashMap<>();
        for (MigrationResource resource : MigrationResource.ordered()) {
            values.put(
                    resource,
                    Math.max(0, resources.path(resource.externalName()).asInt(0))
            );
        }
        return values;
    }

    @Override
    public ExportPage load(MigrationResource resource, int limit, int offset) throws IOException {
        String name = URLEncoder.encode(resource.externalName(), StandardCharsets.UTF_8.name());
        String url = baseUrl + "/export-resource.php?resource=" + name
                + "&limit=" + limit
                + "&offset=" + offset;

        JsonNode payload = mapper.readTree(client.get(url));
        if (!payload.path("success").asBoolean(false)) {
            throw new IOException(payload.path("message").asText("Esportazione remota non riuscita."));
        }

        JsonNode data = payload.path("data");
        JsonNode records = data.path("items");
        JsonNode page = data.path("page");
        if (!records.isArray() || !page.isObject()) {
            throw new IOException("Formato JSON remoto non valido per " + resource.externalName());
        }

        int nextOffset = page.path("nextOffset").isNull()
                ? offset + records.size()
                : page.path("nextOffset").asInt(offset + records.size());

        return new ExportPage(
                payload,
                records.size(),
                page.path("hasNext").asBoolean(false),
                nextOffset
        );
    }

    private JsonNode readManifest() throws IOException {
        JsonNode root = mapper.readTree(client.get(baseUrl + "/get-manifest.php"));
        if (!root.path("success").asBoolean(false)) {
            throw new IOException("Il servizio remoto non ha restituito un manifest valido.");
        }
        int schemaVersion = root.path("data").path("schemaVersion").asInt(-1);
        if (schemaVersion != 1) {
            throw new IOException("Versione schema remoto non supportata: " + schemaVersion);
        }
        return root;
    }
}
