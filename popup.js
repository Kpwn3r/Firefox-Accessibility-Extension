// Populate the dropdown with available voices
function populateVoiceList() {
  const voiceSelect = document.getElementById("voiceSelect");
  const voices = speechSynthesis.getVoices();

  voiceSelect.innerHTML = ""; // Clear existing options

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  browser.storage.local.get("selectedVoice").then((result) => {
    if (result.selectedVoice) {
      voiceSelect.value = result.selectedVoice;
    }
  });
}

// Save the selected voice
function saveSelectedVoice() {
  const selectedVoice = document.getElementById("voiceSelect").value;
  browser.storage.local.set({ selectedVoice });
}

// Save the selected mode
function saveSelectedMode() {
  const selectedMode = document.getElementById("modeSelect").value;
  browser.storage.local.set({ selectedMode });
}

// Load the saved mode
function loadSelectedMode() {
  browser.storage.local.get("selectedMode").then((result) => {
    if (result.selectedMode) {
      document.getElementById("modeSelect").value = result.selectedMode;
    }
  });
}

// Stop speech when the stop button is clicked
document.getElementById("stopButton").addEventListener("click", () => {
  browser.runtime.sendMessage({ action: "stop" });
});

// Populate voices and modes when the popup is opened
populateVoiceList();
loadSelectedMode();

speechSynthesis.onvoiceschanged = populateVoiceList;

// Listen for changes in the dropdown menus
document.getElementById("voiceSelect").addEventListener("change", saveSelectedVoice);
document.getElementById("modeSelect").addEventListener("change", saveSelectedMode);
