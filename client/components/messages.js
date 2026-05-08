export function renderMessage(text, isOwn = false) {
  const div = document.createElement("div");
  div.classList.add("message");
  if (isOwn) div.classList.add("own");
  div.textContent = text;
  return div;
}

export function appendMessage(container, text, isOwn = false) {
  const msg = renderMessage(text, isOwn);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

export function renderHistory(container, messages) {
  container.innerHTML = "";
  messages.forEach((msg) => {
    appendMessage(container, msg.text, msg.isOwn);
  });
}