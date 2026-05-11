let usuariosLista = null;
export function initUsersComponent(containerId) {
    usuariosLista = document.getElementById(containerId);
}
export function updateUserList(users) {
    if (!usuariosLista) return;
    let html = '<h4>📋 Conectados (' + users.length + ')</h4>';
    users.forEach(user => {
        html += `<div class="user-item">🟢 ${user}</div>`;
    });
    usuariosLista.innerHTML = html;
}