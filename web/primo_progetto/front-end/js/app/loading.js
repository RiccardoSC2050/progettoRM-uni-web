export function showLoading(container, title) {
  container.innerHTML = `
    <h2>${title}</h2>
    <p>Caricamento...</p>
  `;
}
