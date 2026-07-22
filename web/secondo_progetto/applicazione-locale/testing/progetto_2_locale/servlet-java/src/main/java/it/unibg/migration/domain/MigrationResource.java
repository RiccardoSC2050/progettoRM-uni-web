package it.unibg.migration.domain;

import java.util.Arrays;
import java.util.List;

public enum MigrationResource {
    CONTRATTI("contratti"),
    SIM_ATTIVE("simAttive"),
    SIM_DISATTIVE("simDisattive"),
    SIM_NON_ATTIVE("simNonAttive"),
    TELEFONATE("telefonate");

    private final String externalName;

    MigrationResource(String externalName) {
        this.externalName = externalName;
    }

    public String externalName() {
        return externalName;
    }

    public static List<MigrationResource> ordered() {
        return Arrays.asList(values());
    }
}
