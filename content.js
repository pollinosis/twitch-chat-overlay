class TwitchChatOverlay {
  constructor() {
    this.overlayContainer = null;
    this.chatMessages = [];
    this.maxMessages = 10;
    this.dragHandle = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.currentUrl = window.location.href;
    this.injectedScript = null;
    this.settings = {
      enabled: true,
      position: 'custom',
      opacity: 0.8,
      fontSize: 14,
      maxMessages: 10,
      x: 20,
      y: 20
    };
    this.init();
  }

  init() {
    console.log('Twitch Chat Overlay: Initializing');
    this.loadSettings();
    this.createOverlay();
    
    // Only inject script if we're on a stream page
    if (this.isTwitchStreamPage()) {
      console.log('Twitch Chat Overlay: On stream page, injecting script');
      this.injectScript();
    } else {
      console.log('Twitch Chat Overlay: Not on stream page, hiding overlay');
      if (this.overlayContainer) {
        this.overlayContainer.style.display = 'none';
      }
    }
    
    this.setupMessageListener();
    this.setupNavigationListener();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['overlaySettings']);
      if (result.overlaySettings) {
        this.settings = { ...this.settings, ...result.overlaySettings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  createOverlay() {
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'twitch-chat-overlay-container';
    this.overlayContainer.style.opacity = this.settings.opacity;
    this.overlayContainer.style.fontSize = `${this.settings.fontSize}px`;
    
    // Use custom position
    this.overlayContainer.style.left = `${this.settings.x}px`;
    this.overlayContainer.style.bottom = `${this.settings.y}px`;
    
    if (!this.settings.enabled) {
      this.overlayContainer.style.display = 'none';
    }
    
    // Create drag handle
    this.dragHandle = document.createElement('div');
    this.dragHandle.className = 'overlay-drag-handle';
    this.dragHandle.title = 'ドラッグしてオーバーレイを移動';
    this.overlayContainer.appendChild(this.dragHandle);
    
    // Setup drag functionality
    this.setupDragAndDrop();
    
    document.body.appendChild(this.overlayContainer);
  }

  setupDragAndDrop() {
    let startX, startY, startLeft, startBottom;
    
    const startDrag = (e) => {
      this.isDragging = true;
      this.overlayContainer.classList.add('dragging');
      
      const rect = this.overlayContainer.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(this.overlayContainer.style.left) || rect.left;
      startBottom = parseInt(this.overlayContainer.style.bottom) || (window.innerHeight - rect.bottom);
      
      // Add class to enable dragging
      this.overlayContainer.classList.add('draggable');
      
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDrag);
      
      e.preventDefault();
    };
    
    const drag = (e) => {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = startY - e.clientY; // Inverted for bottom positioning
      
      const newLeft = Math.max(0, Math.min(window.innerWidth - 400, startLeft + deltaX));
      const newBottom = Math.max(0, Math.min(window.innerHeight - 100, startBottom + deltaY));
      
      this.overlayContainer.style.left = `${newLeft}px`;
      this.overlayContainer.style.bottom = `${newBottom}px`;
    };
    
    const stopDrag = () => {
      this.isDragging = false;
      this.overlayContainer.classList.remove('dragging', 'draggable');
      
      // Save position
      this.settings.x = parseInt(this.overlayContainer.style.left) || 20;
      this.settings.y = parseInt(this.overlayContainer.style.bottom) || 20;
      this.saveSettings();
      
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', stopDrag);
    };
    
    this.dragHandle.addEventListener('mousedown', startDrag);
    
    // Also enable dragging on hover
    this.overlayContainer.addEventListener('mouseenter', () => {
      if (!this.isDragging) {
        this.overlayContainer.classList.add('draggable');
      }
    });
    
    this.overlayContainer.addEventListener('mouseleave', () => {
      if (!this.isDragging) {
        this.overlayContainer.classList.remove('draggable');
      }
    });
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ overlaySettings: this.settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  injectScript() {
    console.log('Twitch Chat Overlay: Injecting script...');
    
    // Remove previous script if exists
    if (this.injectedScript) {
      this.injectedScript.remove();
    }
    
    // First inject cleanup script
    const cleanupScript = document.createElement('script');
    cleanupScript.src = chrome.runtime.getURL('cleanup-script.js');
    cleanupScript.onload = () => {
      console.log('Twitch Chat Overlay: Cleanup script executed');
      cleanupScript.remove();
      
      // Now inject the main script after cleanup
      setTimeout(() => {
        console.log('Twitch Chat Overlay: Creating new monitor script');
        this.injectedScript = document.createElement('script');
        this.injectedScript.src = chrome.runtime.getURL('inject-minimal.js');
        this.injectedScript.onload = function() {
          console.log('Twitch Chat Overlay: Monitor script loaded successfully');
        };
        (document.head || document.documentElement).appendChild(this.injectedScript);
      }, 200);
    };
    
    (document.head || document.documentElement).appendChild(cleanupScript);
  }

  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Only accept messages from the same origin
      if (event.origin !== window.location.origin) {
        return;
      }
      
      console.log('Twitch Chat Overlay: Received message:', event.data);
      
      if (event.data && event.data.type === 'TWITCH_CHAT_MESSAGE') {
        console.log('Twitch Chat Overlay: Processing chat message');
        this.addMessage(event.data.message);
      }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updateSettings') {
        this.updateSettings(request.settings);
      }
    });
  }

  addMessage(messageData) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    
    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'chat-username';
    usernameSpan.textContent = messageData.username + ': ';
    usernameSpan.style.color = messageData.color || '#9147ff';
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'chat-text';
    messageSpan.textContent = messageData.text;
    
    messageElement.appendChild(usernameSpan);
    messageElement.appendChild(messageSpan);
    
    this.overlayContainer.appendChild(messageElement);
    this.chatMessages.push(messageElement);
    
    if (this.chatMessages.length > this.settings.maxMessages) {
      const oldMessage = this.chatMessages.shift();
      oldMessage.remove();
    }
    
    setTimeout(() => {
      messageElement.classList.add('fade-in');
    }, 10);
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Update position if provided
    if (newSettings.x !== undefined) {
      this.overlayContainer.style.left = `${this.settings.x}px`;
    }
    if (newSettings.y !== undefined) {
      this.overlayContainer.style.bottom = `${this.settings.y}px`;
    }
    
    this.overlayContainer.style.opacity = this.settings.opacity;
    this.overlayContainer.style.fontSize = `${this.settings.fontSize}px`;
    this.overlayContainer.style.display = this.settings.enabled ? 'block' : 'none';
    
    if (this.settings.maxMessages !== this.maxMessages) {
      this.maxMessages = this.settings.maxMessages;
      while (this.chatMessages.length > this.maxMessages) {
        const oldMessage = this.chatMessages.shift();
        oldMessage.remove();
      }
    }
  }

  setupNavigationListener() {
    // Watch for URL changes (SPA navigation)
    let lastUrl = this.currentUrl;
    
    const checkForNavigation = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('Twitch Chat Overlay: Page navigation detected', lastUrl, '->', currentUrl);
        lastUrl = currentUrl;
        this.currentUrl = currentUrl;
        
        // Check if we're still on a Twitch stream page
        if (this.isTwitchStreamPage()) {
          console.log('Twitch Chat Overlay: On stream page, showing overlay');
          
          // Show overlay if it was hidden
          if (this.overlayContainer && this.settings.enabled) {
            this.overlayContainer.style.display = 'block';
          }
          
          // Clear existing messages
          this.clearMessages();
          
          // Re-inject script for new page
          setTimeout(() => {
            console.log('Twitch Chat Overlay: Re-initializing for new page');
            this.injectScript();
          }, 1500); // Slightly longer delay to let Twitch fully load
        } else {
          console.log('Twitch Chat Overlay: Not on stream page, hiding overlay');
          // Hide overlay if not on stream page
          if (this.overlayContainer) {
            this.overlayContainer.style.display = 'none';
          }
        }
      }
    };
    
    // Check for navigation every 500ms
    setInterval(checkForNavigation, 500);
    
    // Also listen for popstate events
    window.addEventListener('popstate', () => {
      setTimeout(checkForNavigation, 100);
    });
    
    // Listen for Twitch's own navigation events
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      setTimeout(checkForNavigation, 100);
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      setTimeout(checkForNavigation, 100);
    };
  }

  isTwitchStreamPage() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    
    console.log('Twitch Chat Overlay: Checking if stream page:', url);
    console.log('Twitch Chat Overlay: Pathname:', pathname);
    
    // Check if we're on a stream page (not directory, settings, etc.)
    const isStreamPage = url.includes('twitch.tv') && 
           !url.includes('/directory') && 
           !url.includes('/settings') && 
           !url.includes('/subscriptions') &&
           !url.includes('/following') &&
           !url.includes('/browse') &&
           !url.includes('/videos') &&
           !pathname.endsWith('/') && // Exclude homepage
           pathname.split('/').length === 2 && // Should be /username format
           pathname.split('/')[1].length > 0; // Username should not be empty
           
    console.log('Twitch Chat Overlay: Is stream page?', isStreamPage);
    return isStreamPage;
  }

  clearMessages() {
    // Clear all existing chat messages
    this.chatMessages.forEach(message => {
      if (message && message.remove) {
        message.remove();
      }
    });
    this.chatMessages = [];
    console.log('Twitch Chat Overlay: Cleared all messages');
  }

  reinitializeForNewPage() {
    if (this.overlayContainer && this.settings.enabled) {
      this.overlayContainer.style.display = 'block';
      this.clearMessages();
      this.injectScript();
    }
  }
}

const overlay = new TwitchChatOverlay();