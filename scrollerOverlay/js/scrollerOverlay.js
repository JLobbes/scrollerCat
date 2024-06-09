// NOTE: Serving modules locally causes CORS issue, all JS included in index.html
//       Will complete modularity if application becomes dynamic. 
//       Import statement below for that condition.

// import { loadUpText } from 'initalText.js';
// import { settingsPanel } from 'settingsPanel.js';
// import { toolbar } from 'toolbar.js';
// import { PasteZoneStyler } from 'PasteZoneStyler.js';
// import { NightModeStyler } from 'NightModeStyler.js';
// import { Application } from 'Application.js';
// import { TextScroller } from 'TextScroller.js;

const scrollerOverlay = new Overlay();

scrollerOverlay.prepareTextScroller = function() {
    this.textScroller = new TextScroller(this.isIphone);
    this.textScroller.setInitialText(loadUpText);
    this.textScroller.handleUserTextInput();
}

scrollerOverlay.prepareSettingsPanel = function() {
    this.settingsPanel = settingsPanel;
    this.settingsPanel.loadButtonPanelHTML();
    this.settingsPanel.addEventListeners();

    // Stitch buttons from settingPanel to textScroller functions
    // Cycle toggle button until previously saved state is hit
    const nightModeStyler = new NightModeStyler();
    this.settingsPanel.buttonContainers['nightMode'].mainFunction = () => {
        const indexOfCurrentState = this.settingsPanel.buttonContainers['nightMode'].indexOfCurrentState;
        const newStateValue = this.settingsPanel.buttonContainers['nightMode'].states[indexOfCurrentState]['value']; 
        nightModeStyler.toggleNightMode(newStateValue);
    };
    this.settingsPanel.buttonContainers['nightMode'].cycleButton();


    this.settingsPanel.buttonContainers['adjustFontSize'].mainFunction = () => {
        const indexOfCurrentState = this.settingsPanel.buttonContainers['adjustFontSize'].indexOfCurrentState;
        const newStateValue = this.settingsPanel.buttonContainers['adjustFontSize'].states[indexOfCurrentState]['value']; 
        this.textScroller.setFontSize(newStateValue);
    };
    document.fonts.ready.then(() => {
        // Ensure that styles are applied before initial text mapping
        this.settingsPanel.buttonContainers['adjustFontSize'].cycleButton();
    });


    
    this.settingsPanel.buttonContainers['scrollerBoxWidth'].mainFunction = () => {
        const indexOfCurrentState = this.settingsPanel.buttonContainers['scrollerBoxWidth'].indexOfCurrentState;
        const newStateValue = this.settingsPanel.buttonContainers['scrollerBoxWidth'].states[indexOfCurrentState]['value']; 
        this.textScroller.setScrollerBoxWidth(newStateValue);
    };
    this.settingsPanel.buttonContainers['scrollerBoxWidth'].cycleButton();


    this.settingsPanel.buttonContainers['scrollerBoxHeight'].mainFunction = () => {
        const indexOfCurrentState = this.settingsPanel.buttonContainers['scrollerBoxHeight'].indexOfCurrentState;
        const newStateValue = this.settingsPanel.buttonContainers['scrollerBoxHeight'].states[indexOfCurrentState]['value']; 
        this.textScroller.setScrollerBoxHeight(newStateValue);
    };
    this.settingsPanel.buttonContainers['scrollerBoxHeight'].cycleButton();

    const keypressPowerButton = this.settingsPanel.buttonContainers['keypressPower'];
    if(!scrollerOverlay.isIphone) {
        keypressPowerButton.mainFunction = () => {
            const indexOfCurrentState = keypressPowerButton.indexOfCurrentState;
            const newStateValue = keypressPowerButton.states[indexOfCurrentState]['value']; 
            this.textScroller.setKeyboardStep(newStateValue);
        };
        keypressPowerButton.cycleButton();
    } else {
        delete this.settingsPanel.buttonContainers['keypressPower'];
        console.log(this.settingsPanel.buttonContainers);
        document.querySelector('#keypressPower').remove();
    }

    
    this.settingsPanel.buttonContainers['dragSpeed'].mainFunction = () => {
        const indexOfCurrentState = this.settingsPanel.buttonContainers['dragSpeed'].indexOfCurrentState;
        const newStateValue = this.settingsPanel.buttonContainers['dragSpeed'].states[indexOfCurrentState]['value']; 
        this.textScroller.setDragMultiplier(newStateValue);
    };
    this.settingsPanel.buttonContainers['dragSpeed'].cycleButton();


    this.settingsPanel.buttonContainers['autoScroll'].mainFunction = () => {
        const indexOfCurrentState = this.settingsPanel.buttonContainers['autoScroll'].indexOfCurrentState;
        const newStateValue = this.settingsPanel.buttonContainers['autoScroll'].states[indexOfCurrentState]['value']; 
        this.textScroller.setAutoScrollConfiguration(newStateValue);
    };
    this.settingsPanel.buttonContainers['autoScroll'].cycleButton();

}

scrollerOverlay.prepareToolbar = function() {
    this.toolbar = toolbar; 
    this.toolbar.loadButtonPanelHTML(); 
    this.toolbar.addEventListeners();


    const pasteZoneStyler = new PasteZoneStyler();
    this.toolbar.buttonContainers['userTextInput'].mainFunction = () => {
        const indexOfCurrentState = this.toolbar.buttonContainers['userTextInput'].indexOfCurrentState;
        const newStateValue = this.toolbar.buttonContainers['userTextInput'].states[indexOfCurrentState]['value']; 
        pasteZoneStyler.togglePasteZone(newStateValue);
        if(newStateValue) {
            this.textScroller.handleUserTextInput();
        }
    };
    this.toolbar.panel.querySelector('.close').addEventListener('click', () => {
        this.toolbar.buttonContainers['userTextInput'].indexOfCurrentState = 0;
        this.toolbar.buttonContainers['userTextInput'].updateButtonElem();
        pasteZoneStyler.closePasteZone();
    });
    

    const playPauseButton = this.toolbar.buttonContainers['read'];
    playPauseButton.mainFunction = () => {
        this.textScroller.toggleAutoScroll();
    };

    this.toolbar.buttonContainers['centerText'].mainFunction = () => {
        this.textScroller.centerText();
    };
}

scrollerOverlay.startApplication = function() {
    this.prepareTextScroller();
    this.prepareSettingsPanel();
    this.prepareToolbar();
}

scrollerOverlay.startApplication();
