package it.unibg.migration.web;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public abstract class JsonServlet extends HttpServlet {
    protected ObjectMapper mapper;

    @Override
    public void init() {
        mapper = new ApplicationFactory().mapper();
    }

    protected void write(HttpServletResponse response, int status, Object body) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        mapper.writeValue(response.getWriter(), body);
    }
}
