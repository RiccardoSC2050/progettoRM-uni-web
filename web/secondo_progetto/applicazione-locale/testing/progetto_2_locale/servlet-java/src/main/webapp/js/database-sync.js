export class DatabaseSyncView {
    constructor({ button, status }) {
        this.button = button;
        this.status = status;
    }

    async synchronize(loader, { announce = true } = {}) {
        this.button.disabled = true;
        this.status.textContent = "Lettura dei database da PostgreSQL...";
        try {
            const result = await loader();
            const count = Array.isArray(result.databases) ? result.databases.length : 0;
            const timestamp = new Intl.DateTimeFormat("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }).format(new Date());
            this.status.textContent = `${count} database disponibili · ultimo controllo ${timestamp}`;
            return result;
        } catch (error) {
            this.status.textContent = `Sincronizzazione non riuscita: ${error.message}`;
            if (announce) {
                throw error;
            }
            return null;
        } finally {
            this.button.disabled = false;
        }
    }
}
