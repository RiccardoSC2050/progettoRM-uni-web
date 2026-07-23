package it.unibg.migration.domain;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Catalogo unico delle risorse migrate.
 *
 * La relazione con il contratto viene descritta qui, così il coordinatore non
 * deve duplicare nomi di campi o regole di dipendenza.
 */
public enum MigrationResource {
    CONTRATTI("contratti", "Contratti telefonici", ResourceRole.ROOT, "numero"),
    SIM_ATTIVE("simAttive", "SIM attive", ResourceRole.RELATED, "associataA", "associata_a"),
    SIM_DISATTIVE("simDisattive", "SIM disattive", ResourceRole.RELATED, "eraAssociataA", "era_associata_a"),
    TELEFONATE("telefonate", "Telefonate", ResourceRole.RELATED, "effettuataDa", "effettuata_da");

    private final String externalName;
    private final String displayName;
    private final ResourceRole role;
    private final List<String> contractFields;

    MigrationResource(
            String externalName,
            String displayName,
            ResourceRole role,
            String... contractFields
    ) {
        this.externalName = externalName;
        this.displayName = displayName;
        this.role = role;
        this.contractFields = Collections.unmodifiableList(Arrays.asList(contractFields));
    }

    public String externalName() {
        return externalName;
    }

    public String displayName() {
        return displayName;
    }

    public boolean isRoot() {
        return role == ResourceRole.ROOT;
    }

    public boolean isRelatedToContract() {
        return role == ResourceRole.RELATED;
    }

    /** Restituisce il numero contratto letto da un record remoto. */
    public String contractNumber(JsonNode record) {
        for (String field : contractFields) {
            JsonNode value = record.path(field);
            if (!value.isMissingNode() && !value.isNull()) {
                String text = value.asText().trim();
                if (!text.isEmpty()) {
                    return text;
                }
            }
        }
        return null;
    }

    public static List<MigrationResource> ordered() {
        return Arrays.asList(values());
    }

    public static List<MigrationResource> relatedResources() {
        return Arrays.asList(SIM_ATTIVE, SIM_DISATTIVE, TELEFONATE);
    }

    private enum ResourceRole {
        ROOT,
        RELATED
    }
}
