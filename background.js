let speechQueue = [];
let isSpeaking = false;
let selectedVoice = null;

// Load the selected voice from storage
browser.storage.local.get("selectedVoice").then((result) => {
  selectedVoice = result.selectedVoice || null;
});

// Watch for changes to the selected voice
browser.storage.onChanged.addListener((changes) => {
  if (changes.selectedVoice) {
    selectedVoice = changes.selectedVoice.newValue;
  }
});

// Process the speech queue
function processQueue() {
  if (speechQueue.length > 0 && !isSpeaking) {
    const text = speechQueue.shift();
    const utterance = new SpeechSynthesisUtterance(text);

    // Set the voice if one is selected
    if (selectedVoice) {
      const voice = speechSynthesis.getVoices().find((v) => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }

    isSpeaking = true;

    utterance.onend = () => {
      isSpeaking = false;
      processQueue();
    };

    speechSynthesis.speak(utterance);
  }
}

// Handle messages from content scripts
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "speak") {
    speechQueue.push(message.text);
    processQueue();
  } else if (message.action === "stop") {
    speechSynthesis.cancel();
    speechQueue = [];
    isSpeaking = false;
  }
});
