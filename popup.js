// Populate the dropdown with available voices
function populateVoiceList() {
    const voiceSelect = document.getElementById("voiceSelect");
    const voices = speechSynthesis.getVoices();
  
    // Clear existing options
    voiceSelect.innerHTML = "";
  
    // Add voices to the dropdown
    voices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
  
    // Load the saved voice preference
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
  
  // Populate voices when the popup is opened
  populateVoiceList();
  speechSynthesis.onvoiceschanged = populateVoiceList;
  
  // Listen for changes in the dropdown menu
  document.getElementById("voiceSelect").addEventListener("change", saveSelectedVoice);
  