console.log("Firefox TTS Extension loaded");

class FirefoxSpeechHandler {
  constructor() {
    this.currentUtterance = null;
    this.utteranceQueue = [];
    this.voices = [];
    this.selectedVoice = null;
    this.isHighlightMode = true;
    this.initialize();
  }

  async initialize() {
    await this.loadVoices();
    await this.loadPreferences();
    this.setupEventListeners();
  }

  loadVoices() {
    return new Promise((resolve) => {
      const checkVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.voices = voices;
          console.log("Available voices:", this.voices);
          resolve();
        } else {
          setTimeout(checkVoices, 100);
        }
      };
      checkVoices();
    });
  }

  async loadPreferences() {
    const [voiceResult, modeResult] = await Promise.all([
      browser.storage.local.get("selectedVoice"),
      browser.storage.local.get("selectedMode")
    ]);
    this.selectedVoice = voiceResult.selectedVoice;
    this.isHighlightMode = (modeResult.selectedMode || "highlight") === "highlight";
    console.log("Loaded preferences - voice:", this.selectedVoice, "mode:", this.isHighlightMode ? "highlight" : "continuous");
  }

  setupEventListeners() {
    document.addEventListener('selectionchange', () => {
      const selection = window.getSelection().toString().trim();
      if (!selection && this.isHighlightMode) {
        this.stop(true);
      }
    });

    document.addEventListener('mouseup', () => {
      setTimeout(() => {
        const selection = window.getSelection().toString().trim();
        if (selection) {
          if (this.isHighlightMode) {
            this.speak(selection);
          } else {
            this.speak(selection);
          }
        }
      }, 100);
    });

    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "speak") {
        this.speak(request.text).then(sendResponse);
        return true;
      }
      if (request.action === "stop") {
        this.stop(request.force || false);
        sendResponse({ status: "stopped" });
        return true;
      }
      if (request.action === "readAll") {
        const allText = this.getAllText();
        this.speak(allText).then(sendResponse);
        return true;
      }
    });

    browser.storage.onChanged.addListener((changes) => {
      if (changes.selectedVoice) {
        this.selectedVoice = changes.selectedVoice.newValue;
        console.log("Voice preference changed to:", this.selectedVoice);
      }
      if (changes.selectedMode) {
        this.isHighlightMode = changes.selectedMode.newValue === "highlight";
        console.log("Mode changed to:", this.isHighlightMode ? "highlight" : "continuous");
      }
    });
  }

  getAllText() {
    const bodyText = document.body.innerText;
    return bodyText.split(/\n\s*\n/).filter(line => line.trim() !== "").join("\n\n");
  }

  speak(text) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        console.error("Web Speech API not available");
        return resolve({ status: "error", error: "API not available" });
      }

      this.stop(true); // Clear queue forcefully when new speech starts

      const chunks = this.chunkText(text);
      let completedChunks = 0;

      chunks.forEach((chunk, index) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        this.utteranceQueue.push(utterance);

        // Apply voice settings to EVERY chunk
        if (this.selectedVoice) {
          const voice = this.voices.find(v => v.name === this.selectedVoice);
          if (voice) utterance.voice = voice;
        }

        utterance.onend = () => {
          this.utteranceQueue = this.utteranceQueue.filter(u => u !== utterance);
          completedChunks++;
          if (completedChunks === chunks.length) {
            resolve({ status: "success" });
          }
        };

        utterance.onerror = (event) => {
          this.utteranceQueue = this.utteranceQueue.filter(u => u !== utterance);
          resolve({ status: "error", error: event.error });
        };

        // Speak the first chunk immediately, others will queue automatically
        if (index === 0) {
          window.speechSynthesis.speak(utterance);
          this.currentUtterance = utterance;
        }
      });
    });
  }

  stop(forceClear = false) {
    window.speechSynthesis.cancel();
    this.currentUtterance = null;
    if (forceClear) {
      this.utteranceQueue = [];
    }
  }

  chunkText(text) {
    const chunkSize = 15000; // Web Speech API safe limit
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks.length > 0 ? chunks : [text];
  }
}

new FirefoxSpeechHandler();