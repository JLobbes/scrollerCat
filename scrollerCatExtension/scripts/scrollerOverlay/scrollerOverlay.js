// This is a test doc to ensure modularity by attatching the scripts to the window object.

// scripts/scrollerOverlay/scrollerOverlay.js
(function() {
    // Ensure the DOM is fully loaded before injecting the overlay
        console.log('loaded!!!');
      const testIcon = chrome.runtime.getURL('../../images/hammer-icon.png');
  
      const scrollerOverlay = document.createElement('div');
      scrollerOverlay.id = 'scrollerOverlay';
      scrollerOverlay.innerHTML = `
        <div>
          <img src="${testIcon}" alt="Icon 1">
        </div>
      `;
        

      document.body.appendChild(scrollerOverlay);
  })();
  
  