package it.unibg.migration.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import it.unibg.migration.application.MigrationCoordinator;
import it.unibg.migration.infrastructure.config.AppSettings;
import it.unibg.migration.infrastructure.gateway.DjangoImportGateway;
import it.unibg.migration.infrastructure.gateway.PhpExportGateway;
import it.unibg.migration.infrastructure.http.JsonHttpClient;

public final class ApplicationFactory {
    private final AppSettings settings;
    private final ObjectMapper mapper;
    private final JsonHttpClient client;

    public ApplicationFactory() {
        settings = AppSettings.load();
        mapper = new ObjectMapper();
        client = new JsonHttpClient();
    }

    public MigrationCoordinator migrationCoordinator() {
        return new MigrationCoordinator(
                new PhpExportGateway(client, mapper, settings.remoteBaseUrl()),
                new DjangoImportGateway(client, mapper, settings.djangoBaseUrl()),
                settings.pageSize()
        );
    }

    public ObjectMapper mapper() {
        return mapper;
    }

    public PhpExportGateway phpGateway() {
        return new PhpExportGateway(client, mapper, settings.remoteBaseUrl());
    }

    public DjangoImportGateway djangoGateway() {
        return new DjangoImportGateway(client, mapper, settings.djangoBaseUrl());
    }
}
