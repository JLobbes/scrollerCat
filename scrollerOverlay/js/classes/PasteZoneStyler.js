class PasteZoneStyler {
    constructor() {
        this.textInputButtonContainer = document.querySelector('#userTextInput');
        this.nestedButtons = this.textInputButtonContainer.parentElement;
        this.pasteTextZone;
    }

    preparePasteZoneHTML() {
        // Create pasteZone <textarea>
        const pasteZone = document.createElement('textarea');
        pasteZone.id = 'textInput';
        pasteZone.placeholder = 'Paste here...';

        // Add pasteZone <textarea> to .nested-element container
        this.nestedButtons.insertBefore(pasteZone, this.textInputButtonContainer);  
        this.pasteTextZone = pasteZone;
    }

    togglePasteZone(closed) {
        if(closed) {
            this.closePasteZone();
        } else {
            this.openPasteZone();
        }
    }

    openPasteZone() {
        this.preparePasteZoneHTML();

        setTimeout(() => {
            this.pasteTextZone.classList.add('visible');
            this.pasteTextZone.focus();
        }, 25);
    }
    
    closePasteZone() {
        if(this.pasteTextZone) {
            this.pasteTextZone.classList.remove('visible');
    
            setTimeout(() => {
                this.pasteTextZone.remove();
                this.pasteTextZone = null;
            }, 200);
        }
    }
}

// const pasteZoneStyler = new PasteZoneStyler();
// export { pasteZoneStyler }