package it.unibg.migration.web;

import it.unibg.migration.domain.DatabaseName;
import it.unibg.migration.infrastructure.gateway.DjangoImportGateway;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/databases")
public final class DatabaseServlet extends JsonServlet {
    private DjangoImportGateway django;

    @Override
    public void init() {
        super.init();
        django = new ApplicationFactory().djangoGateway();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("success", true);
        result.put("databases", django.databases());
        write(response, HttpServletResponse.SC_OK, result);
    }
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            DatabaseName database = DatabaseName.of(request.getParameter("database"));
            django.delete(database);
            result.put("success", true);
            result.put("database", database.value());
            result.put("deleted", true);
            write(response, HttpServletResponse.SC_OK, result);
        } catch (IllegalArgumentException exception) {
            result.put("success", false);
            result.put("message", exception.getMessage());
            write(response, HttpServletResponse.SC_BAD_REQUEST, result);
        } catch (IOException exception) {
            result.put("success", false);
            result.put("message", exception.getMessage());
            write(response, HttpServletResponse.SC_BAD_GATEWAY, result);
        }
    }

}
