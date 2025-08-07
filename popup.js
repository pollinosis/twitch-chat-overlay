document.addEventListener('DOMContentLoaded', () => {
  const enableOverlay = document.getElementById('enableOverlay');
  const opacity = document.getElementById('opacity');
  const fontSize = document.getElementById('fontSize');
  const maxMessages = document.getElementById('maxMessages');
  const saveButton = document.getElementById('saveButton');
  const saveMessage = document.getElementById('saveMessage');
  
  const opacityValue = document.getElementById('opacityValue');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const maxMessagesValue = document.getElementById('maxMessagesValue');
  
  chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
    if (settings) {
      enableOverlay.checked = settings.enabled;
      opacity.value = settings.opacity;
      fontSize.value = settings.fontSize;
      maxMessages.value = settings.maxMessages;
      
      opacityValue.textContent = settings.opacity;
      fontSizeValue.textContent = settings.fontSize + 'px';
      maxMessagesValue.textContent = settings.maxMessages;
    }
  });
  
  opacity.addEventListener('input', () => {
    opacityValue.textContent = opacity.value;
  });
  
  fontSize.addEventListener('input', () => {
    fontSizeValue.textContent = fontSize.value + 'px';
  });
  
  maxMessages.addEventListener('input', () => {
    maxMessagesValue.textContent = maxMessages.value;
  });
  
  saveButton.addEventListener('click', () => {
    const settings = {
      enabled: enableOverlay.checked,
      opacity: parseFloat(opacity.value),
      fontSize: parseInt(fontSize.value),
      maxMessages: parseInt(maxMessages.value)
    };
    
    chrome.runtime.sendMessage({
      action: 'saveSettings',
      settings: settings
    }, (response) => {
      if (response && response.success) {
        saveMessage.classList.add('show');
        setTimeout(() => {
          saveMessage.classList.remove('show');
        }, 2000);
      }
    });
  });
});