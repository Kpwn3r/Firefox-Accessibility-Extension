console.log("Background script loaded");

// Forward messages between popup and content scripts
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "readAll" && message.tabId) {
    // Forward readAll to specific tab
    return browser.tabs.sendMessage(message.tabId, message)
      .catch(err => console.log("ReadAll error:", err));
  }
  
  if (sender.tab) {
    // Forward from content script to popup (if needed)
    return Promise.resolve();
  }
  
  // Forward from popup to all tabs
  if (message.action === "stop") {
    browser.tabs.query({}).then(tabs => {
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, message)
          .catch(err => console.log("Tab not ready:", tab.id, err));
      });
    });
  }
});

// Track active tab for potential future use
let activeTabId = null;
browser.tabs.onActivated.addListener((activeInfo) => {
  activeTabId = activeInfo.tabId;
});