package it.unibg.migration.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import it.unibg.migration.domain.ExportPage;
import it.unibg.migration.domain.MigrationResource;

import java.util.LinkedHashSet;
import java.util.Set;

/** Operazioni pure sui payload JSON esportati dal servizio PHP. */
public final class ExportPayload {
    private ExportPayload() {
    }

    public static JsonNode items(ExportPage page) {
        JsonNode items = page.payload().path("data").path("items");
        if (!items.isArray()) {
            throw new IllegalArgumentException("Il payload remoto non contiene data.items.");
        }
        return items;
    }

    public static Set<String> contractNumbers(ExportPage page, MigrationResource resource) {
        Set<String> values = new LinkedHashSet<>();
        for (JsonNode record : items(page)) {
            String number = resource.contractNumber(record);
            if (number != null) {
                values.add(number);
            }
        }
        return values;
    }

    public static FilteredPayload relatedTo(
            ExportPage page,
            MigrationResource resource,
            Set<String> selectedContracts
    ) {
        ObjectNode root = page.payload().deepCopy();
        JsonNode dataNode = root.path("data");
        if (!(dataNode instanceof ObjectNode)) {
            throw new IllegalArgumentException("Il payload remoto non contiene un oggetto data.");
        }

        ArrayNode filtered = root.arrayNode();
        for (JsonNode record : items(page)) {
            String number = resource.contractNumber(record);
            if (number != null && selectedContracts.contains(number)) {
                filtered.add(record.deepCopy());
            }
        }

        ((ObjectNode) dataNode).set("items", filtered);
        return new FilteredPayload(root, filtered.size());
    }

    public static final class FilteredPayload {
        private final JsonNode payload;
        private final int recordCount;

        private FilteredPayload(JsonNode payload, int recordCount) {
            this.payload = payload;
            this.recordCount = recordCount;
        }

        public JsonNode payload() {
            return payload;
        }

        public int recordCount() {
            return recordCount;
        }
    }
}
