package it.unibg.migration.infrastructure.gateway;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import it.unibg.migration.application.port.LocalImportPort;
import it.unibg.migration.domain.DatabaseName;
import it.unibg.migration.domain.MigrationResource;
import it.unibg.migration.infrastructure.http.JsonHttpClient;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public final class DjangoImportGateway implements LocalImportPort {
    private final JsonHttpClient client;
    private final ObjectMapper mapper;
    private final String baseUrl;

    public DjangoImportGateway(JsonHttpClient client, ObjectMapper mapper, String baseUrl) {
        this.client = client;
        this.mapper = mapper;
        this.baseUrl = baseUrl;
    }

    @Override
    public void verify() throws IOException {
        client.get(baseUrl + "/health/");
    }

    @Override
    public List<String> databases() throws IOException {
        JsonNode root = mapper.readTree(client.get(baseUrl + "/databases/"));
        List<String> values = new ArrayList<>();
        for (JsonNode node : root.path("databases")) {
            values.add(node.asText());
        }
        return values;
    }

    @Override
    public void prepare(DatabaseName database) throws IOException {
        client.post(
                baseUrl + "/databases/prepare/",
                mapper.writeValueAsString(mapper.createObjectNode().put("database", database.value()))
        );
    }

    @Override
    public void delete(DatabaseName database) throws IOException {
        client.delete(
                baseUrl + "/databases/delete/",
                mapper.writeValueAsString(
                        mapper.createObjectNode().put("database", database.value())
                )
        );
    }

    @Override
    public int save(DatabaseName database, MigrationResource resource, JsonNode payload) throws IOException {
        String resourceName = encode(resource.externalName());
        String databaseName = encode(database.value());
        String response = client.post(
                baseUrl + "/import/" + resourceName + "/?database=" + databaseName,
                mapper.writeValueAsString(payload)
        );
        JsonNode root = mapper.readTree(response);
        if (!root.path("success").asBoolean(false)) {
            throw new IOException(root.path("message").asText("Importazione locale non riuscita."));
        }
        return root.path("imported").asInt(0);
    }

    private String encode(String value) throws IOException {
        return URLEncoder.encode(value, StandardCharsets.UTF_8.name());
    }
}
