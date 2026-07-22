package it.unibg.migration.domain;

import com.fasterxml.jackson.databind.JsonNode;

public final class ExportPage {
    private final JsonNode payload;
    private final int recordCount;
    private final boolean hasNext;
    private final int nextOffset;

    public ExportPage(JsonNode payload, int recordCount, boolean hasNext, int nextOffset) {
        this.payload = payload;
        this.recordCount = recordCount;
        this.hasNext = hasNext;
        this.nextOffset = nextOffset;
    }

    public JsonNode payload() {
        return payload;
    }

    public int recordCount() {
        return recordCount;
    }

    public boolean hasNext() {
        return hasNext;
    }

    public int nextOffset() {
        return nextOffset;
    }
}
