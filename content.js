let isTextSelected = false; // Track whether valid text is selected

document.addEventListener("mouseup", () => {
  setTimeout(() => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      isTextSelected = true; // Mark valid selection
      browser.runtime.sendMessage({ action: "speak", text: selectedText });
    }
  }, 10); // Delay to ensure selection is properly captured
});

document.addEventListener("mousedown", () => {
  // Always stop speech and reset the state when clicking anywhere
  browser.runtime.sendMessage({ action: "stop" });
  isTextSelected = false; // Reset the selection state
});
