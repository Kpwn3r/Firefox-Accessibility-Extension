let isHighlightMode = true; // Default mode
let isTextHighlighted = false; // Tracks whether text is currently highlighted

// Listen for changes in the selection
document.addEventListener("selectionchange", () => {
  const selectedText = window.getSelection().toString().trim();
  isTextHighlighted = !!selectedText; // Update the flag based on the selection

  if (!isTextHighlighted && isHighlightMode) {
    // Stop speech if text is no longer highlighted and we're in highlight mode
    browser.runtime.sendMessage({ action: "stop" });
  }
});

// Listen for mouseup events to read highlighted text
document.addEventListener("mouseup", () => {
  setTimeout(() => {
    const selectedText = window.getSelection().toString().trim();

    // Get the current mode from storage
    browser.storage.local.get("selectedMode").then((result) => {
      const mode = result.selectedMode || "highlight";
      isHighlightMode = mode === "highlight";

      if (selectedText) {
        // Speak the text if it's highlighted
        browser.runtime.sendMessage({ action: "speak", text: selectedText });
      }
    });
  }, 10);
});

// Function to gather all readable text from the page
function getAllText() {
  const bodyText = document.body.innerText;
  console.log("All text gathered:", bodyText);  // Debug: check if text is gathered
  return bodyText.split("\n").filter((line) => line.trim() !== "");  // Split into lines and filter empty lines
}

// Listen for the "readAllText" action
browser.runtime.onMessage.addListener((message) => {
  console.log("Received message in content.js:", message);  // Debug: Check if message is received
  if (message.action === "readAllText") {
    console.log("Reading all text on the page...");
    const allText = getAllText();  // Get all readable text from the page

    // Send each text block to the background script for reading
    allText.forEach((text) => {
      console.log("Sending text to background:", text);  // Debug: Check each text block
      browser.runtime.sendMessage({ action: "speak", text: text });
    });
  }
});