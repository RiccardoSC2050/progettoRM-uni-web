package it.unibg.migration.web;

import it.unibg.migration.infrastructure.gateway.DjangoImportGateway;
import it.unibg.migration.infrastructure.gateway.PhpExportGateway;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@WebServlet("/api/status")
public final class StatusServlet extends JsonServlet {
    private PhpExportGateway php;
    private DjangoImportGateway django;

    @Override
    public void init() {
        super.init();
        ApplicationFactory factory = new ApplicationFactory();
        php = factory.phpGateway();
        django = factory.djangoGateway();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, Object> result = new LinkedHashMap<>();
        boolean remote = verifyRemote();
        boolean local = verifyLocal();
        result.put("remotePhp", remote ? "ok" : "errore");
        result.put("django", local ? "ok" : "errore");
        result.put("success", remote && local);
        write(response, HttpServletResponse.SC_OK, result);
    }

    private boolean verifyRemote() {
        try {
            php.verify();
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    private boolean verifyLocal() {
        try {
            django.verify();
            return true;
        } catch (Exception exception) {
            return false;
        }
    }
}
