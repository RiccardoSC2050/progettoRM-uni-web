package it.unibg.migration.infrastructure.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public final class AppSettings {
    private final String remoteBaseUrl;
    private final String djangoBaseUrl;
    private final int pageSize;

    private AppSettings(String remoteBaseUrl, String djangoBaseUrl, int pageSize) {
        this.remoteBaseUrl = remoteBaseUrl;
        this.djangoBaseUrl = djangoBaseUrl;
        this.pageSize = pageSize;
    }

    public static AppSettings load() {
        Properties properties = new Properties();
        try (InputStream stream = AppSettings.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (stream == null) {
                throw new IllegalStateException("Configurazione non trovata.");
            }
            properties.load(stream);
            return new AppSettings(
                    require(properties, "remote.base.url"),
                    require(properties, "django.base.url"),
                    Integer.parseInt(require(properties, "migration.page.size"))
            );
        } catch (IOException exception) {
            throw new IllegalStateException(exception);
        }
    }

    public String remoteBaseUrl() {
        return remoteBaseUrl;
    }

    public String djangoBaseUrl() {
        return djangoBaseUrl;
    }

    public int pageSize() {
        return pageSize;
    }

    private static String require(Properties properties, String key) {
        String value = properties.getProperty(key);
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalStateException("Configurazione mancante: " + key);
        }
        return value.trim();
    }
}
