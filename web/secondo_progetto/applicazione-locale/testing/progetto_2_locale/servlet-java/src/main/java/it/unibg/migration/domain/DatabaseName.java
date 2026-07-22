package it.unibg.migration.domain;

import java.util.regex.Pattern;

public final class DatabaseName {
    private static final Pattern VALID = Pattern.compile("[A-Za-z][A-Za-z0-9_]{0,62}");
    private final String value;

    private DatabaseName(String value) {
        this.value = value;
    }

    public static DatabaseName of(String value) {
        String normalized = value == null ? "" : value.trim();
        if (!VALID.matcher(normalized).matches()) {
            throw new IllegalArgumentException(
                    "Il nome deve iniziare con una lettera e contenere solo lettere, numeri o underscore."
            );
        }
        return new DatabaseName(normalized);
    }

    public String value() {
        return value;
    }
}
