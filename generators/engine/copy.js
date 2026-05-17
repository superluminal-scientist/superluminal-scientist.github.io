export function attachCopyButton(buttonEl, getText) {
  const originalText = buttonEl.textContent;
  let resetTimer = null;
  buttonEl.addEventListener("click", async () => {
    const flash = (msg, ms) => {
      buttonEl.textContent = msg;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { buttonEl.textContent = originalText; }, ms);
    };
    try {
      await navigator.clipboard.writeText(getText());
      flash("Copied", 1000);
    } catch {
      flash("Copy failed", 2000);
    }
  });
}
