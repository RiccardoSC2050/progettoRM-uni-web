package it.unibg.migration.web;

import it.unibg.migration.application.MigrationCoordinator;
import it.unibg.migration.domain.DatabaseName;
import it.unibg.migration.domain.MigrationReport;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/import")
public final class ImportServlet extends JsonServlet {
    private MigrationCoordinator coordinator;

    @Override
    public void init() {
        super.init();
        coordinator = new ApplicationFactory().migrationCoordinator();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            DatabaseName database = DatabaseName.of(request.getParameter("database"));
            write(response, HttpServletResponse.SC_OK, coordinator.migrate(database));
        } catch (IllegalArgumentException exception) {
            write(
                    response,
                    HttpServletResponse.SC_BAD_REQUEST,
                    MigrationReport.failure(exception.getMessage())
            );
        } catch (Exception exception) {
            write(
                    response,
                    HttpServletResponse.SC_BAD_GATEWAY,
                    MigrationReport.failure(exception.getMessage())
            );
        }
    }
}
