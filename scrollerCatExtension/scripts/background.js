// This script section handles listening for the extension button click and sends
// a message to the content-script to show the ScrollerOverlay.

// background.js
console.log('background.js loaded');

chrome.action.onClicked.addListener((tab) => {
  console.log('extension button clicked');

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['scripts/scrollerOverlay.js']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      console.log("scrollerOverlay injected successfully.");
    }
  });
});

console.log('Listener registered');


//  the following listener is waiting for messages to capture 
//  the active tab. This can't be done on the main thread directly.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureVisibleTab') {
      chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
          if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError.message });
          } else {
              sendResponse({ screenshotUrl: dataUrl });
          }
      });
      
      return true;
  }
});