package it.unibg.migration.infrastructure.http;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

public final class JsonHttpClient {
    public String get(String url) throws IOException {
        return execute(url, "GET", null);
    }

    public String post(String url, String body) throws IOException {
        return execute(url, "POST", body);
    }

    public String delete(String url, String body) throws IOException {
        return execute(url, "DELETE", body);
    }

    private String execute(String url, String method, String body) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod(method);
        connection.setConnectTimeout(15000);
        connection.setReadTimeout(60000);
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
        if (body != null) {
            connection.setDoOutput(true);
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            connection.setFixedLengthStreamingMode(bytes.length);
            try (OutputStream output = connection.getOutputStream()) {
                output.write(bytes);
            }
        }
        int status = connection.getResponseCode();
        InputStream stream = status >= 200 && status < 300
                ? connection.getInputStream()
                : connection.getErrorStream();
        String response;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            response = reader.lines().collect(Collectors.joining("\n"));
        }
        if (status < 200 || status >= 300) {
            throw new IOException("HTTP " + status + ": " + response);
        }
        return response;
    }
}
