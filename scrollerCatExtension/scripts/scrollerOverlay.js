// This is a test doc to ensure modularity by attatching the scripts to the window object.

// scripts/scrollerOverlay/scrollerOverlay.js
(function () {
  console.log('scrollerOverlay.js script loaded');

  function injectScrollerOverlay() {
    const testIcon = chrome.runtime.getURL('../../images/hammer-icon.png');
    // Test Class used.
    const testClassInstance = new window.TestClass();
    testClassInstance.someMethod();

    const scrollerOverlay = document.createElement('div');
    scrollerOverlay.id = 'scrollerOverlay';
    scrollerOverlay.innerHTML = `
          <div>
            <img src="${testIcon}" alt="testIcon of a hammer.">
            <p>This was injected from scrollerOverlay.js</p>
            <p>It's not listed in the manifest but rather dynamically injected.</p>
          </div>
        `;
  
    document.body.appendChild(scrollerOverlay);
    console.log('scrollerOverlay injected');
  }

  injectScrollerOverlay();
})();