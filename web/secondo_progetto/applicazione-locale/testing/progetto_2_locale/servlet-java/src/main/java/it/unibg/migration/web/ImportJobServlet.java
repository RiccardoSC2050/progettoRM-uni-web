package it.unibg.migration.web;

import it.unibg.migration.application.MigrationCoordinator;
import it.unibg.migration.application.MigrationJobRegistry;
import it.unibg.migration.application.MigrationJobSnapshot;
import it.unibg.migration.domain.DatabaseName;
import it.unibg.migration.domain.MigrationReport;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(urlPatterns = {"/api/import/start", "/api/import/progress"})
public final class ImportJobServlet extends JsonServlet {
    private static final int DEFAULT_LIMIT = 100;
    private static final int MAX_LIMIT = 1000;

    private MigrationCoordinator coordinator;
    private MigrationJobRegistry jobs;

    @Override
    public void init() {
        super.init();
        coordinator = new ApplicationFactory().migrationCoordinator();
        jobs = MigrationJobRegistry.instance();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!request.getServletPath().endsWith("/start")) {
            write(response, HttpServletResponse.SC_METHOD_NOT_ALLOWED, MigrationReport.failure("Metodo non consentito."));
            return;
        }

        try {
            DatabaseName database = DatabaseName.of(request.getParameter("database"));
            int limit = parseLimit(request.getParameter("limit"));
            write(
                    response,
                    HttpServletResponse.SC_ACCEPTED,
                    jobs.start(coordinator, database, limit)
            );
        } catch (IllegalArgumentException exception) {
            write(response, HttpServletResponse.SC_BAD_REQUEST, MigrationReport.failure(exception.getMessage()));
        } catch (IllegalStateException exception) {
            write(response, HttpServletResponse.SC_CONFLICT, MigrationReport.failure(exception.getMessage()));
        } catch (Exception exception) {
            write(response, HttpServletResponse.SC_BAD_GATEWAY, MigrationReport.failure(exception.getMessage()));
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (!request.getServletPath().endsWith("/progress")) {
            write(response, HttpServletResponse.SC_METHOD_NOT_ALLOWED, MigrationReport.failure("Metodo non consentito."));
            return;
        }

        String jobId = request.getParameter("jobId");
        if (jobId == null || jobId.trim().isEmpty()) {
            write(response, HttpServletResponse.SC_BAD_REQUEST, MigrationReport.failure("Parametro jobId obbligatorio."));
            return;
        }

        MigrationJobSnapshot snapshot = jobs.get(jobId.trim());
        if (snapshot == null) {
            write(response, HttpServletResponse.SC_NOT_FOUND, MigrationReport.failure("Importazione non trovata."));
            return;
        }
        write(response, HttpServletResponse.SC_OK, snapshot);
    }

    private int parseLimit(String value) {
        if (value == null || value.trim().isEmpty()) {
            return DEFAULT_LIMIT;
        }
        try {
            int limit = Integer.parseInt(value.trim());
            if (limit < 1 || limit > MAX_LIMIT) {
                throw new IllegalArgumentException(
                        "Il numero di contratti deve essere compreso tra 1 e " + MAX_LIMIT + "."
                );
            }
            return limit;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Il numero di contratti non è valido.");
        }
    }
}
