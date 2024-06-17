// This script handles listening for the extension button click and sends
// a message to the content-script to show the ScrollerOverlay.

// background.js
console.log('background.js loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.action.onClicked.addListener((tab) => {
  console.log('extension button clicked');

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['scripts/scrollerOverlay.js']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      console.log("Script injected successfully.");
    }
  });
});

console.log('Listener registered');


