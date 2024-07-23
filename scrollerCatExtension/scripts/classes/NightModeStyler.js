// scripts/classes/NightModeStyler.js

(function() {
    class NightModeStyler {
        constructor() {
            this.nightModeSpecificSelectors = [    
                '#scrollerOverlayContainer',    
                '#scrollerText', 
                '.text-wrapper', 
                '.button-panel textarea',
            ];
            this.scrollerText = document.querySelector('#scrollerText')
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

            this.scrollerText.style.color = "#fff";
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

            this.scrollerText.style.color = "#111";
        }
    }

    window.NightModeStyler = NightModeStyler;
})();