(function() {
  // Prevent multiple instances
  if (window.twitchChatOverlayInjected) {
    console.log('Twitch Chat Overlay: Monitor already running, skipping');
    return;
  }
  window.twitchChatOverlayInjected = true;
  
  console.log('Twitch Chat Overlay: Safe read-only chat monitor started');
  
  // Track processed messages to avoid duplicates
  let processedMessageIds = new Set();
  let isInitialized = false;
  let observer = null;
  let retryCount = 0;
  let maxRetries = 10;
  
  // Generate a unique ID for a message to prevent duplicates
  function getMessageId(messageElement) {
    const username = messageElement.querySelector('[data-a-target="chat-message-username"]')?.textContent?.trim() || '';
    const messageBody = messageElement.querySelector('[data-a-target="chat-line-message-body"]');
    const text = messageBody ? Array.from(messageBody.querySelectorAll('.text-fragment')).map(el => el.textContent).join('') : '';
    const timestamp = messageElement.getAttribute('data-test-selector') || messageElement.dataset.timestamp || Date.now();
    return `${username}:${text}:${timestamp}`;
  }
  
  // Extract message data safely
  function extractMessageData(messageElement) {
    try {
      const usernameElement = messageElement.querySelector('[data-a-target="chat-message-username"]');
      const messageBody = messageElement.querySelector('[data-a-target="chat-line-message-body"]');
      
      if (!usernameElement || !messageBody) {
        return null;
      }
      
      const username = usernameElement.textContent.trim();
      
      // Get text content from fragments
      const textFragments = messageBody.querySelectorAll('.text-fragment, [data-a-target="chat-message-text"]');
      let text = '';
      
      if (textFragments.length > 0) {
        text = Array.from(textFragments).map(el => el.textContent).join('');
      } else {
        // Fallback: get all text content
        text = messageBody.textContent.trim();
      }
      
      // Get username color
      const color = usernameElement.style.color || 
                   window.getComputedStyle(usernameElement).color || 
                   '#9147ff';
      
      return {
        username: username,
        text: text.trim(),
        color: color
      };
    } catch (error) {
      console.error('Twitch Chat Overlay: Error extracting message:', error);
      return null;
    }
  }
  
  // Process a chat message
  function processMessage(messageElement) {
    const messageId = getMessageId(messageElement);
    
    // Skip if already processed
    if (processedMessageIds.has(messageId)) {
      return;
    }
    
    // Mark as processed
    processedMessageIds.add(messageId);
    
    // Clean up old IDs to prevent memory leak
    if (processedMessageIds.size > 200) {
      const idsArray = Array.from(processedMessageIds);
      for (let i = 0; i < 50; i++) {
        processedMessageIds.delete(idsArray[i]);
      }
    }
    
    const messageData = extractMessageData(messageElement);
    if (messageData && messageData.username && messageData.text) {
      console.log('Twitch Chat Overlay: Processing message from', messageData.username);
      
      window.postMessage({
        type: 'TWITCH_CHAT_MESSAGE',
        message: messageData
      }, '*');
    }
  }
  
  // Start monitoring chat
  function startMonitoring() {
    console.log('Twitch Chat Overlay: Looking for chat container...');
    const container = document.querySelector('[data-test-selector="chat-scrollable-area__message-container"]');
    console.log('Twitch Chat Overlay: Chat container found:', !!container);
    
    if (!container) {
      retryCount++;
      console.log(`Twitch Chat Overlay: Chat container not found, retrying in 1s... (${retryCount}/${maxRetries})`);
      
      if (retryCount < maxRetries) {
        setTimeout(startMonitoring, 1000);
      } else {
        console.log('Twitch Chat Overlay: Max retries reached, giving up');
      }
      return;
    }
    
    if (isInitialized) {
      console.log('Twitch Chat Overlay: Already initialized, skipping');
      return;
    }
    isInitialized = true;
    
    console.log('Twitch Chat Overlay: Found chat container, starting safe monitor');
    
    // Skip initial messages to avoid spam
    let skipInitial = true;
    setTimeout(() => {
      skipInitial = false;
      console.log('Twitch Chat Overlay: Now monitoring for new messages');
    }, 3000);
    
    // Create observer for new messages only
    observer = new MutationObserver((mutations) => {
      if (skipInitial) return;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if this node or its children contain chat messages
              let chatMessages = [];
              
              // Direct check
              if (node.getAttribute && node.getAttribute('data-a-target') === 'chat-line-message') {
                chatMessages.push(node);
              }
              
              // Child check
              if (node.querySelectorAll) {
                const childMessages = node.querySelectorAll('[data-a-target="chat-line-message"]');
                chatMessages.push(...Array.from(childMessages));
              }
              
              // Process each found message
              chatMessages.forEach(messageElement => {
                processMessage(messageElement);
              });
            }
          });
        }
      });
    });
    
    // Start observing - only watch for new children, don't go deep into subtree
    observer.observe(container, {
      childList: true,
      subtree: false
    });
    
    console.log('Twitch Chat Overlay: Observer started on chat container');
  }
  
  // Cleanup function for navigation
  window.twitchChatOverlayCleanup = function() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    processedMessageIds.clear();
    isInitialized = false;
    retryCount = 0;
    window.twitchChatOverlayInjected = false;
    console.log('Twitch Chat Overlay: Cleaned up observer');
  };
  
  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(startMonitoring, 2000);
    });
  } else {
    setTimeout(startMonitoring, 2000);
  }
})();