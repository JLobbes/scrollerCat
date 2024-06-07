class NightModeStyler {
    constructor() {
        this.nightModeSpecificSelectors = [    
            'body',    
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
            divider.src = 'images/divider-icon-night-mode.png';
        });
    }
    
    removeNightMode() {
        this.nightModeSpecificSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach((element) => {
               element.classList.remove('night-mode'); 
            });
        });
        
        this.dividers.forEach((divider) => {
            divider.src = 'images/divider-icon.png';
        });
    }
}

// export { NightModeStyler }