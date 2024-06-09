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
    const nightModeStyler = new NightModeStyler();
    const nightModeButton = this.settingsPanel.buttonContainers['nightMode'];
    nightModeButton.mainFunction = () => {
        const indexOfCurrentState = nightModeButton.indexOfCurrentState;
        const newStateValue = nightModeButton.states[indexOfCurrentState]['value']; 
        nightModeStyler.toggleNightMode(newStateValue);
    };
    nightModeButton.renderSavedState();


    const fontSizeButton = this.settingsPanel.buttonContainers['adjustFontSize'];
    fontSizeButton.mainFunction = () => {
        const indexOfCurrentState = fontSizeButton.indexOfCurrentState;
        const newStateValue = fontSizeButton.states[indexOfCurrentState]['value']; 
        this.textScroller.setFontSize(newStateValue);
    };
    document.fonts.ready.then(() => {
        // Ensure that styles are applied before initial text mapping
        fontSizeButton.renderSavedState();
    });

    
    const scrollerBoxWidthButton = this.settingsPanel.buttonContainers['scrollerBoxWidth'];
    scrollerBoxWidthButton.mainFunction = () => {
        const indexOfCurrentState = scrollerBoxWidthButton.indexOfCurrentState;
        const newStateValue = this.settingsPanel.buttonContainers['scrollerBoxWidth'].states[indexOfCurrentState]['value']; 
        this.textScroller.setScrollerBoxWidth(newStateValue);
    };
    scrollerBoxWidthButton.renderSavedState();


    const scrollerBoxHeightButon = this.settingsPanel.buttonContainers['scrollerBoxHeight'];
    scrollerBoxHeightButon.mainFunction = () => {
        const indexOfCurrentState = scrollerBoxHeightButon.indexOfCurrentState;
        const newStateValue = scrollerBoxHeightButon.states[indexOfCurrentState]['value']; 
        this.textScroller.setScrollerBoxHeight(newStateValue);
    };
    scrollerBoxHeightButon.renderSavedState();


    const keypressPowerButton = this.settingsPanel.buttonContainers['keypressPower'];
    if(!scrollerOverlay.isIphone) {
        keypressPowerButton.mainFunction = () => {
            const indexOfCurrentState = keypressPowerButton.indexOfCurrentState;
            const newStateValue = keypressPowerButton.states[indexOfCurrentState]['value']; 
            this.textScroller.setKeyboardStep(newStateValue);
        };
        keypressPowerButton.renderSavedState();
    } else {
        delete this.settingsPanel.buttonContainers['keypressPower'];
        console.log(this.settingsPanel.buttonContainers);
        document.querySelector('#keypressPower').remove();
    }

    
    const dragSpeedButton = this.settingsPanel.buttonContainers['dragSpeed'];
    dragSpeedButton.mainFunction = () => {
        const indexOfCurrentState = dragSpeedButton.indexOfCurrentState;
        const newStateValue = dragSpeedButton.states[indexOfCurrentState]['value']; 
        this.textScroller.setDragMultiplier(newStateValue);
    };
    dragSpeedButton.renderSavedState();


    const autoScrollButton = this.settingsPanel.buttonContainers['autoScroll'];
    autoScrollButton.mainFunction = () => {
        const indexOfCurrentState = autoScrollButton.indexOfCurrentState;
        const newStateValue = autoScrollButton.states[indexOfCurrentState]['value']; 
        this.textScroller.setAutoScrollConfiguration(newStateValue);
    };
    autoScrollButton.renderSavedState();
}

scrollerOverlay.prepareToolbar = function() {
    this.toolbar = toolbar; 
    this.toolbar.loadButtonPanelHTML(); 
    this.toolbar.addEventListeners();

    const pasteZoneStyler = new PasteZoneStyler();
    const inputTextButton = this.toolbar.buttonContainers['userTextInput'];
    inputTextButton.mainFunction = () => {
        const indexOfCurrentState = inputTextButton.indexOfCurrentState;
        const newStateValue = inputTextButton.states[indexOfCurrentState]['value']; 
        pasteZoneStyler.togglePasteZone(newStateValue);
        if(newStateValue) {
            this.textScroller.handleUserTextInput();
        }
    };
    this.toolbar.panel.querySelector('.close').addEventListener('click', () => {
        inputTextButton.indexOfCurrentState = 0;
        inputTextButton.updateButtonElem();
        pasteZoneStyler.closePasteZone();
    });


    const playPauseButton = this.toolbar.buttonContainers['read'];
    playPauseButton.mainFunction = () => {
        this.textScroller.toggleAutoScroll();
    };

    const centerTextButton = this.toolbar.buttonContainers['centerText'];
    centerTextButton.mainFunction = () => {
        this.textScroller.centerText();
    };
}

scrollerOverlay.startApplication = function() {
    this.prepareTextScroller();
    this.prepareSettingsPanel();
    this.prepareToolbar();
}

scrollerOverlay.startApplication();
