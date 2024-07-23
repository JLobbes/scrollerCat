// scripts/scrollerOverlay.js
// uses window.ButtonPanel class
// uses window.loadUpText
// uses window.NightModeStyler class
// uses window.OCRHelper class
// uses window.TextScroller class
// uses window.ScrollerOverlay class

(function () {
    console.log("scrollerOverlay.js script loaded");
    // Everything is wrapped in an immediately invoked function to
    // avoid polluting the global namespace of the window object.

    try {
        const existingOverlay = document.getElementById("scrollerOverlayContainer");
        if (existingOverlay) {
            return;
        }
    } catch (e) {
        console.error(e.message);
    }

    function injectScrollerOverlay() {
        const scrollerOverlay = new window.ScrollerOverlay();

        scrollerOverlay.prepareTextScroller = function () {
            this.textScroller = new window.TextScroller(this.isIphone);
            this.textScroller.setInitialText(loadUpText);
            this.textScroller.handleUserTextInput();
        };

        scrollerOverlay.prepareToolbar = function () {
            this.toolbar = new window.ButtonPanel("scrollerCatToolbar", this);

            this.toolbar.createButton("centerText");
            const centerTextIcon = chrome.runtime.getURL(
                "images/center-icon.png"
            );
            this.toolbar.buttonContainers["centerText"].setIconData(
                centerTextIcon,
                "Icon to indicate text centered in scrollerBox"
            );

            this.toolbar.createButton("dragSelect");
            const dragSelectIcon = chrome.runtime.getURL(
                "images/drag-select-icon.png"
            );
            this.toolbar.buttonContainers["dragSelect"].setIconData(
                dragSelectIcon,
                "Icon to indicate screen click and drag selection for OCR"
            );

            this.toolbar.createButton("scrapeText");
            const curvingArrowIcon = chrome.runtime.getURL(
                "images/highlightText-icon.png"
            );
            this.toolbar.buttonContainers["scrapeText"].setIconData(
                curvingArrowIcon,
                "Icon to indicate click and highlight selection for scrollerOverlay"
            );

            this.toolbar.createToggleButton(
                "read",
                "nextState",
                false // State not saved to local storage
            );
            const stopIcon = chrome.runtime.getURL("images/stop-icon.png");
            this.toolbar.buttonContainers["read"].addState(
                "stop",
                stopIcon,
                "Stop icon to stop auto-scroll.",
                false
            );
            const playIcon = chrome.runtime.getURL("images/play-icon.png");
            this.toolbar.buttonContainers["read"].addState(
                "scrollerCatPlay",
                playIcon,
                "Play icon to start auto-scrollArrow curving towards textScroller to indicate text will pushed to textScroller.",
                true
            );

            this.toolbar.loadButtonPanelHTML();
            this.toolbar.addEventListeners();

            const playPauseButton = this.toolbar.buttonContainers["read"];
            playPauseButton.mainFunction = () => {
                this.textScroller.toggleAutoScroll();
            };
            document.addEventListener('autoScrollRebound', () => {
                playPauseButton.advanceState();
                // advanceState() includes the mainFunction code
            });

            const centerTextButton = this.toolbar.buttonContainers["centerText"];
            centerTextButton.mainFunction = () => {
                this.textScroller.centerText();
            };

            const OCRHelper = new window.OCRHelper();
            const dragSelectButton = this.toolbar.buttonContainers["dragSelect"];
            dragSelectButton.mainFunction = async () => {
                scrollerOverlay.minimizeScrollerOverlay();
                try {
                    OCRHelper.removeHighlights();
                    const extractedText = await OCRHelper.initiateDragSelect();
                    scrollerOverlay.textScroller.handleUserTextInput(extractedText);
                    scrollerOverlay.maximizeScrollerOverlay();
                } catch (error) {
                    console.error('Error during OCR process:', error);
                }
            };

            const MiniTextScraper = new window.MiniTextScraper();
            const scrapeTextButton = this.toolbar.buttonContainers["scrapeText"];
            scrapeTextButton.mainFunction = async () => {
                OCRHelper.removeHighlights();
                scrollerOverlay.minimizeScrollerOverlay();
                const scrapedText = await MiniTextScraper.initiateScrape();
                scrollerOverlay.textScroller.handleUserTextInput(scrapedText);
                scrollerOverlay.maximizeScrollerOverlay();
            }
        };

        scrollerOverlay.prepareSettingsPanel = function () {
            this.settingsPanel = new window.ButtonPanel("settings", this);

            this.settingsPanel.createToggleButton(
                "nightMode",
                "nextState",
                true // State saved to local storage
            );
            const daylightModeIcon = chrome.runtime.getURL(
                "images/daylight-mode-icon.png"
            );
            this.settingsPanel.buttonContainers["nightMode"].addState(
                "nightModeOff",
                daylightModeIcon,
                "Image of sun to indicate daylight mode off.",
                false
            );
            const nightModeIcon = chrome.runtime.getURL(
                "images/night-mode-icon.png"
            );
            this.settingsPanel.buttonContainers["nightMode"].addState(
                "nightModeOn",
                nightModeIcon,
                "Image of moon and stars to indicate night mode.",
                true
            );

            this.settingsPanel.createToggleButton(
                "adjustFontSize",
                "currentState",
                true // State saved to local storage
            );
            const fontSizeMediumIcon = chrome.runtime.getURL(
                "images/text-icon-med.png"
            );
            this.settingsPanel.buttonContainers["adjustFontSize"].addState(
                "makeTextMedium",
                fontSizeMediumIcon,
                "Image of text next to 2 horizontal dashes to indicate text is medium sized.",
                40
            );
            const fontSizeLargeIcon = chrome.runtime.getURL(
                "images/text-icon-large.png"
            );
            this.settingsPanel.buttonContainers["adjustFontSize"].addState(
                "makeTextLarger",
                fontSizeLargeIcon,
                "Image of text next to 1 horizontal dashes to indicate text is larger.",
                50
            );
            const fontSizeLargestIcon = chrome.runtime.getURL(
                "images/text-icon-largest.png"
            );
            this.settingsPanel.buttonContainers["adjustFontSize"].addState(
                "makeTextLargest",
                fontSizeLargestIcon,
                "Image of text taking up all available space to indicate text is largest.",
                60
            );
            const fontSizeSmallestIcon = chrome.runtime.getURL(
                "images/text-icon-smallest.png"
            );
            this.settingsPanel.buttonContainers["adjustFontSize"].addState(
                "makeTextSmallest",
                fontSizeSmallestIcon,
                "Image of text next to 4 horizontal dashes to indicate text is smallest.",
                20
            );
            const fontSizeSmallIcon = chrome.runtime.getURL(
                "images/text-icon-smaller.png"
            );
            this.settingsPanel.buttonContainers["adjustFontSize"].addState(
                "makeTextSmaller",
                fontSizeSmallIcon,
                "Image of text next to 3 horizontal dashes to indicate text is smaller.",
                30
            );

            this.settingsPanel.createToggleButton(
                "scrollerBoxWidth",
                "currentState",
                true // State saved to local storage
            );
            const widestIcon = chrome.runtime.getURL("images/widest-icon.png");
            this.settingsPanel.buttonContainers["scrollerBoxWidth"].addState(
                "makeScrollerBoxWidest",
                widestIcon,
                "Doubleheaded arrow between vertical lines to indicate widest scrollbox setting.",
                95
            );
            const narrowestIcon = chrome.runtime.getURL(
                "images/narrowest-icon.png"
            );
            this.settingsPanel.buttonContainers["scrollerBoxWidth"].addState(
                "makeScrollerBoxNarrowest",
                narrowestIcon,
                "Doubleheaded arrow between vertical lines to indicate narrowest scrollbox setting.",
                45
            );
            const widerIcon = chrome.runtime.getURL("images/wider-icon.png");
            this.settingsPanel.buttonContainers["scrollerBoxWidth"].addState(
                "makeScrollerBoxWider",
                widerIcon,
                "Doubleheaded arrow between vertical lines to indicate wider scrollbox setting.",
                70
            );

            this.settingsPanel.createToggleButton(
                "scrollerBoxHeight",
                "currentState",
                true // State saved to local storage
            );
            const tallerIcon = chrome.runtime.getURL("images/taller-icon.png");
            this.settingsPanel.buttonContainers["scrollerBoxHeight"].addState(
                "makeScrollerBoxTaller",
                tallerIcon,
                "Doubleheaded arrow between horizontal lines to indicate taller scrollbox setting.",
                250
            );
            const tallestIcon = chrome.runtime.getURL(
                "images/tallest-icon.png"
            );
            this.settingsPanel.buttonContainers["scrollerBoxHeight"].addState(
                "makeScrollerBoxTallest",
                tallestIcon,
                "Doubleheaded arrow between horizontal lines to indicate tallest scrollbox setting.",
                400
            );
            const shortestIcon = chrome.runtime.getURL(
                "images/shortest-icon.png"
            );
            this.settingsPanel.buttonContainers["scrollerBoxHeight"].addState(
                "makeScrollerBoxShort",
                shortestIcon,
                "Doubleheaded arrow between horizontal lines to indicate shortest scrollbox setting.",
                100
            );

            this.settingsPanel.createToggleButton(
                "keypressPower",
                "currentState",
                true // State saved to local storage
            );
            const keypressDoubleIcon = chrome.runtime.getURL(
                "images/keypress-double-icon.png"
            );
            this.settingsPanel.buttonContainers["keypressPower"].addState(
                "keypressMedium",
                keypressDoubleIcon,
                "Two arrows towards left to indicate key stroke moves text more.",
                200
            );
            const keypressTripleIcon = chrome.runtime.getURL(
                "images/keypress-triple-icon.png"
            );
            this.settingsPanel.buttonContainers["keypressPower"].addState(
                "keypressLarge",
                keypressTripleIcon,
                "Three left to indicate key stroke moves text most.",
                300
            );
            const keypressIcon = chrome.runtime.getURL(
                "images/keypress-icon.png"
            );
            this.settingsPanel.buttonContainers["keypressPower"].addState(
                "keypressSmall",
                keypressIcon,
                "Arrow left to indicate key stroke moves text less.",
                100
            );

            this.settingsPanel.createToggleButton(
                "dragSpeed",
                "currentState",
                true // State saved to local storage
            );
            const pointerDoubleIcon = chrome.runtime.getURL(
                "images/pointer-icon-double.png"
            );
            this.settingsPanel.buttonContainers["dragSpeed"].addState(
                "dragSpeedFast",
                pointerDoubleIcon,
                "Double index finter icon to indicate drag ratio is two-to-one.",
                2
            );
            const pointerTripleIcon = chrome.runtime.getURL(
                "images/pointer-icon-triple.png"
            );
            this.settingsPanel.buttonContainers["dragSpeed"].addState(
                "dragSpeedFastest",
                pointerTripleIcon,
                "Triple index finter icon to indicate drag ratio is three-to-one.",
                3
            );
            const keypressSingleIcon = chrome.runtime.getURL(
                "images/keypress-single-icon.png"
            );
            this.settingsPanel.buttonContainers["dragSpeed"].addState(
                "dragSpeedSlow",
                keypressSingleIcon,
                "Single index finter icon to indicate drag ratio is one-to-one.",
                1
            );

            this.settingsPanel.createToggleButton(
                "autoScroll",
                "currentState",
                true // State saved to local storage
            );
            const sentenceScrollMediumIcon = chrome.runtime.getURL(
                "images/sentence-scroll-med.gif"
            );
            this.settingsPanel.buttonContainers["autoScroll"].addState(
                "autoScrollFast",
                sentenceScrollMediumIcon,
                "Animation of sentence scrolling quickly by to indicate fast auto-scroll",
                {
                    scrollSpeed: 1,
                    frameRate: 5,
                    autoScrollTransition: "transform linear",
                } // 'autoScrollFast'
            );
            const sentenceScrollFastIcon = chrome.runtime.getURL(
                "images/sentence-scroll-fast.gif"
            );
            this.settingsPanel.buttonContainers["autoScroll"].addState(
                "autoScrollFastest",
                sentenceScrollFastIcon,
                "Animation of sentence scrolling fastest by to indicate fastest auto-scroll",
                {
                    scrollSpeed: 1.5,
                    frameRate: 5,
                    autoScrollTransition: "transform linear",
                } // 'autoScrollFastest'
            );
            const sentenceSwipeSlowIcon = chrome.runtime.getURL(
                "images/sentence-swipe-slow.gif"
            );
            this.settingsPanel.buttonContainers["autoScroll"].addState(
                "autoSwipeSlow",
                sentenceSwipeSlowIcon,
                "Animation of sentence scrolling slowly with pointer to indicate  slow auto-swipe ",
                {
                    scrollSpeed: 200,
                    frameRate: 1000,
                    autoScrollTransition: "transform 1.0s ease-in-out",
                } // 'autoSwipeSlow'
            );
            const sentenceSwipeMediumIcon = chrome.runtime.getURL(
                "images/sentence-swipe-med.gif"
            );
            this.settingsPanel.buttonContainers["autoScroll"].addState(
                "autoSwipeFast",
                sentenceSwipeMediumIcon,
                "Animation of sentence scrolling fast with pointer to indicate fast auto-swipe slow",
                {
                    scrollSpeed: 400,
                    frameRate: 1250,
                    autoScrollTransition: "transform 1.5s ease-in-out",
                } // 'autoSwipeFast'
            );
            const sentenceSwipeFastIcon = chrome.runtime.getURL(
                "images/sentence-swipe-fast.gif"
            );
            this.settingsPanel.buttonContainers["autoScroll"].addState(
                "autoSwipeFastest",
                sentenceSwipeFastIcon,
                "Animation of sentence scrolling fastest with pointer to indicate fastest auto-swipe",
                {
                    scrollSpeed: 600,
                    frameRate: 1500,
                    autoScrollTransition: "transform 1.5s ease-in-out",
                } // 'autoSwipeFastest'
            );
            const sentenceScrollSlowIcon = chrome.runtime.getURL(
                "images/sentence-scroll-slow.gif"
            );
            this.settingsPanel.buttonContainers["autoScroll"].addState(
                "autoScrollSlow",
                sentenceScrollSlowIcon,
                "Animation of sentence scrolling slowly by to indicate slow auto-scroll",
                {
                    scrollSpeed: 0.5,
                    frameRate: 5,
                    autoScrollTransition: "transform linear",
                } // 'autoScrollSlow'
            );

            this.settingsPanel.loadButtonPanelHTML();
            this.settingsPanel.addEventListeners();

            // Stitch buttons from settingPanel to textScroller functions
            const nightModeStyler = new window.NightModeStyler();
            const nightModeButton =
                this.settingsPanel.buttonContainers["nightMode"];
            nightModeButton.mainFunction = () => {
                const indexOfCurrentState = nightModeButton.indexOfCurrentState;
                const newStateValue =
                    nightModeButton.states[indexOfCurrentState]["value"];
                nightModeStyler.toggleNightMode(newStateValue);
            };
            nightModeButton.renderSavedState();

            const fontSizeButton =
                this.settingsPanel.buttonContainers["adjustFontSize"];
            fontSizeButton.mainFunction = () => {
                const indexOfCurrentState = fontSizeButton.indexOfCurrentState;
                const newStateValue =
                    fontSizeButton.states[indexOfCurrentState]["value"];
                this.textScroller.setFontSize(newStateValue);
            };
            document.fonts.ready.then(() => {
                // Ensure that styles are applied before initial text mapping
                fontSizeButton.renderSavedState();
            });

            const scrollerBoxWidthButton =
                this.settingsPanel.buttonContainers["scrollerBoxWidth"];
            scrollerBoxWidthButton.mainFunction = () => {
                const indexOfCurrentState =
                    scrollerBoxWidthButton.indexOfCurrentState;
                const newStateValue =
                    this.settingsPanel.buttonContainers["scrollerBoxWidth"]
                        .states[indexOfCurrentState]["value"];
                this.textScroller.setScrollerBoxWidth(newStateValue);
            };
            scrollerBoxWidthButton.renderSavedState();

            const scrollerBoxHeightButon =
                this.settingsPanel.buttonContainers["scrollerBoxHeight"];
            scrollerBoxHeightButon.mainFunction = () => {
                const indexOfCurrentState =
                    scrollerBoxHeightButon.indexOfCurrentState;
                const newStateValue =
                    scrollerBoxHeightButon.states[indexOfCurrentState]["value"];
                this.textScroller.setScrollerBoxHeight(newStateValue);
            };
            scrollerBoxHeightButon.renderSavedState();

            const keypressPowerButton =
                this.settingsPanel.buttonContainers["keypressPower"];
            if (!scrollerOverlay.isIphone) {
                keypressPowerButton.mainFunction = () => {
                    const indexOfCurrentState =
                        keypressPowerButton.indexOfCurrentState;
                    const newStateValue =
                        keypressPowerButton.states[indexOfCurrentState][
                            "value"
                        ];
                    this.textScroller.setKeyboardStep(newStateValue);
                };
                keypressPowerButton.renderSavedState();
            } else {
                delete this.settingsPanel.buttonContainers["keypressPower"];
                console.log(this.settingsPanel.buttonContainers);
                document.querySelector("#keypressPower").remove();
            }

            const dragSpeedButton =
                this.settingsPanel.buttonContainers["dragSpeed"];
            dragSpeedButton.mainFunction = () => {
                const indexOfCurrentState = dragSpeedButton.indexOfCurrentState;
                const newStateValue =
                    dragSpeedButton.states[indexOfCurrentState]["value"];
                this.textScroller.setDragMultiplier(newStateValue);
            };
            dragSpeedButton.renderSavedState();

            const autoScrollButton =
                this.settingsPanel.buttonContainers["autoScroll"];
            autoScrollButton.mainFunction = () => {
                const indexOfCurrentState =
                    autoScrollButton.indexOfCurrentState;
                const newStateValue =
                    autoScrollButton.states[indexOfCurrentState]["value"];
                this.textScroller.setAutoScrollConfiguration(newStateValue);
            };
            autoScrollButton.renderSavedState();
        };

        scrollerOverlay.prepareForInjection = function () {
            this.scrollerOverlayHTML = scrollerOverlay.scrollerOverlayHTML;

            const scrollerOverlayWidth = 700; //px
            const halfWidth = Math.floor(scrollerOverlayWidth / 2);
            this.scrollerOverlayHTML.style.left = `${window.innerWidth / 2 - halfWidth}px`;
            const scrollerOverlayHeight = 400; //px
            const halfHeight = Math.floor(scrollerOverlayHeight / 2);
            this.scrollerOverlayHTML.style.top = `${window.innerHeight / 2 - halfHeight}px`;

            document.body.appendChild(this.scrollerOverlayHTML);

            this.prepareTextScroller();
            this.prepareSettingsPanel(this.scrollerOverlayHTML);
            this.prepareToolbar(this.scrollerOverlayHTML);
        };

        scrollerOverlay.prepareForInjection();

    }

    injectScrollerOverlay();
})();
