let notificacionesDiv = null;
export function initNotificationsComponent(containerId) {
    notificacionesDiv = document.getElementById(containerId);
}
export function renderNotification(text, type) {
    if (!notificacionesDiv) return;
    const note = document.createElement('div');
    note.className = 'notification ' + type;
    note.textContent = text;
    notificacionesDiv.appendChild(note);
    setTimeout(() => { note.remove(); }, 4000);
}