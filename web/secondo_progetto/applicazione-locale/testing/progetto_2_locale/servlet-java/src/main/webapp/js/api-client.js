export async function requestJson(url, options = {}) {
    const response = await fetch(url, {
        cache: "no-store",
        ...options
    });
    const text = await response.text();

    let payload;
    try {
        payload = JSON.parse(text);
    } catch {
        throw new Error(text || "Risposta non valida.");
    }

    if (!response.ok) {
        throw new Error(payload.message || "Operazione non riuscita.");
    }
    return payload;
}
