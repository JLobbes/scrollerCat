// scripts/classes/NightModeStyler.js

(function() {
    class NightModeStyler {
        constructor() {
            this.nightModeSpecificSelectors = [    
                '#scrollerOverlayContainer',    
                '.text', 
                '.text-wrapper', 
                '.button-panel textarea',
            ];
            this.dividers = document.querySelectorAll('.button-divider img');
        }
    
        toggleNightMode = function(applyStyles) {
            if(applyStyles) {
                this.applyNightMode();
            } else {
                this.removeNightMode();
            }
        }
        
        applyNightMode() {
            this.nightModeSpecificSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach((element) => {
                   element.classList.add('night-mode'); 
                });
            });
            
            this.dividers.forEach((divider) => {
                const nightModeDivider = chrome.runtime.getURL('images/divider-icon-night-mode.png');
                divider.src = nightModeDivider;
            });
        }
        
        removeNightMode() {
            this.nightModeSpecificSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach((element) => {
                   element.classList.remove('night-mode'); 
                });
            });
            
            this.dividers.forEach((divider) => {
                const daylightModeDivider = chrome.runtime.getURL('images/divider-icon.png');
                divider.src = daylightModeDivider;
            });
        }
    }

    window.NightModeStyler = NightModeStyler;
})();