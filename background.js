chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    overlaySettings: {
      enabled: true,
      position: 'bottom-left',
      opacity: 0.8,
      fontSize: 14,
      maxMessages: 10
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['overlaySettings'], (result) => {
      sendResponse(result.overlaySettings);
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ overlaySettings: request.settings }, () => {
      chrome.tabs.query({ url: 'https://www.twitch.tv/*' }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings: request.settings
          });
        });
      });
      sendResponse({ success: true });
    });
    return true;
  }
});