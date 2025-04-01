document.addEventListener('DOMContentLoaded', () => {
  const voiceSelect = document.getElementById('voiceSelect');
  
  function populateVoices() {
    // Clear existing options
    voiceSelect.innerHTML = '';
    
    // Get current voices
    const voices = speechSynthesis.getVoices();
    
    // Add a default option if needed
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a voice...';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    voiceSelect.appendChild(defaultOption);
    
    // Add all available voices
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
    
    // Load saved preference and ensure it matches an available voice
    browser.storage.local.get('selectedVoice').then(result => {
      if (result.selectedVoice) {
        // Check if the saved voice exists in the current list
        const voiceExists = voices.some(v => v.name === result.selectedVoice);
        if (voiceExists) {
          voiceSelect.value = result.selectedVoice;
        } else {
          // If saved voice doesn't exist, clear the selection
          browser.storage.local.remove('selectedVoice');
        }
      }
    });
  }

  // Initial population
  populateVoices();
  
  // Re-populate when voices change
  speechSynthesis.onvoiceschanged = populateVoices;

  // Handle voice selection changes
  voiceSelect.addEventListener('change', () => {
    if (voiceSelect.value) {
      browser.storage.local.set({ selectedVoice: voiceSelect.value });
    }
  });

  document.getElementById('stopButton').addEventListener('click', () => {
    // Send stop message to all tabs
    browser.tabs.query({}).then(tabs => {
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, { action: "stop" })
          .catch(err => {//console.log("Tab not ready:", tab.id, err)
        });
      });
    });
  });

  document.getElementById('modeSelect').addEventListener('change', (e) => {
    browser.storage.local.set({ selectedMode: e.target.value });
  });

  // Load current mode
  browser.storage.local.get('selectedMode').then(result => {
    if (result.selectedMode) {
      document.getElementById('modeSelect').value = result.selectedMode;
    }
  });
});