// безопасный выход из fullscreen без падения "Document not active"
export async function safeExitFullscreen() {
  if (typeof document === 'undefined') return false;

  const doc = document;
  const isFullscreen =
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement;

  if (!isFullscreen) return false;

  if (doc.visibilityState !== 'visible' || doc.hidden === true) {
    return false;
  }

  try {
    await (doc.exitFullscreen?.() ||
      doc.webkitExitFullscreen?.() ||
      doc.mozCancelFullScreen?.() ||
      doc.msExitFullscreen?.());
    return true;
  } catch {
    return false;
  }
}
