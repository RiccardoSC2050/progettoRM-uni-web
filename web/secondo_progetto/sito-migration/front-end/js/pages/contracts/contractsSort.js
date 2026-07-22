export function renderContractsSort(sort = "dataAttivazione", direction = "desc") {
  return `
    <form class="contracts-sort-form">
      <div class="contracts-sort-field">
        <label for="contracts-sort">Ordina per</label>
        <select id="contracts-sort" name="sort">
          <option value="dataAttivazione" ${sort === "dataAttivazione" ? "selected" : ""}>Data attivazione</option>
          <option value="numero" ${sort === "numero" ? "selected" : ""}>Numero telefonico</option>
          <option value="telefonate" ${sort === "telefonate" ? "selected" : ""}>Telefonate</option>
        </select>
      </div>

      <div class="contracts-sort-field">
        <label for="contracts-direction">Direzione</label>
        <select id="contracts-direction" name="direction">
          <option value="desc" ${direction === "desc" ? "selected" : ""}>Decrescente</option>
          <option value="asc" ${direction === "asc" ? "selected" : ""}>Crescente</option>
        </select>
      </div>
    </form>
  `;
}
