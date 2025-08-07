// Reset script to clean up previous instance
(function() {
  console.log('Twitch Chat Overlay: Cleanup script running');
  
  if (window.twitchChatOverlayCleanup && typeof window.twitchChatOverlayCleanup === 'function') {
    console.log('Twitch Chat Overlay: Calling cleanup function');
    window.twitchChatOverlayCleanup();
  }
  
  // Force reset flags
  window.twitchChatOverlayInjected = false;
  
  console.log('Twitch Chat Overlay: Cleanup completed, ready for new injection');
})();