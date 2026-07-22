export const DEFAULT_DATABASES = Object.freeze(["DATABASE1", "DATABASE2"]);
export const DEFAULT_DATABASE = DEFAULT_DATABASES[0];
export const POLL_INTERVAL_MS = 500;
export const DATABASE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,62}$/;

export const endpoints = Object.freeze({
    status: "api/status",
    databases: "api/databases",
    deleteDatabase(database) {
        return `api/databases?database=${encodeURIComponent(database)}`;
    },
    importStart(database, limit) {
        return `api/import/start?database=${encodeURIComponent(database)}&limit=${encodeURIComponent(limit)}`;
    },
    importProgress(jobId) {
        return `api/import/progress?jobId=${encodeURIComponent(jobId)}`;
    },
    databaseBrowser(database) {
        return `http://127.0.0.1:8000/api/migration/browser/?database=${encodeURIComponent(database)}`;
    }
});
