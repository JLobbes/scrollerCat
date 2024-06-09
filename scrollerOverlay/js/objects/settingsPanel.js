// import { ButtonPanel } from 'ButtonPanel.js'
const settingsPanel = new ButtonPanel('settings');


settingsPanel.createToggleButton(
    'nightMode', 
    'nextState',
    true // State saved to local storage
);
settingsPanel.buttonContainers['nightMode'].addState(
    'nightModeOff', 
    'images/daylight-mode-icon.png',
    'Image of sun to indicate daylight mode off.',
    false
);
settingsPanel.buttonContainers['nightMode'].addState(
    'nightModeOn', 
    'images/night-mode-icon.png',
    'Image of moon and stars to indicate night mode.',
    true
);

settingsPanel.createToggleButton(
    'adjustFontSize', 
    'currentState',
    true // State saved to local storage
);
settingsPanel.buttonContainers['adjustFontSize'].addState(
    'makeTextMedium', 
    'images/text-icon-med.png',
    'Image of text next to 2 horizontal dashes to indicate text is medium sized.',
    40
);
settingsPanel.buttonContainers['adjustFontSize'].addState(
    'makeTextLarger', 
    'images/text-icon-large.png',
    'Image of text next to 1 horizontal dashes to indicate text is larger.',
    50
);
settingsPanel.buttonContainers['adjustFontSize'].addState(
    'makeTextLargest', 
    'images/text-icon-largest.png',
    'Image of text taking up all available space to indicate text is largest.',
    60
);
settingsPanel.buttonContainers['adjustFontSize'].addState(
    'makeTextSmallest', 
    'images/text-icon-smallest.png',
    'Image of text next to 4 horizontal dashes to indicate text is smallest.',
    20
);
settingsPanel.buttonContainers['adjustFontSize'].addState(
    'makeTextSmaller', 
    'images/text-icon-smaller.png',
    'Image of text next to 3 horizontal dashes to indicate text is smaller.',
    30
);

settingsPanel.createToggleButton(
    'scrollerBoxWidth', 
    'currentState',
    true // State saved to local storage
);
settingsPanel.buttonContainers['scrollerBoxWidth'].addState(
    'makeScrollerBoxWidest', 
    'images/widest-icon.png',
    'Doubleheaded arrow between vertical lines to indicate widest scrollbox setting.',
    95
);
settingsPanel.buttonContainers['scrollerBoxWidth'].addState(
    'makeScrollerBoxNarrowest', 
    'images/narrowest-icon.png',
    'Doubleheaded arrow between vertical lines to indicate narrowest scrollbox setting.',
    45
);
settingsPanel.buttonContainers['scrollerBoxWidth'].addState(
    'makeScrollerBoxWider', 
    'images/wider-icon.png',
    'Doubleheaded arrow between vertical lines to indicate wider scrollbox setting.',
    70
);


settingsPanel.createToggleButton(
    'scrollerBoxHeight', 
    'currentState',
    true // State saved to local storage
);
settingsPanel.buttonContainers['scrollerBoxHeight'].addState(
    'makeScrollerBoxTaller', 
    'images/taller-icon.png',
    'Doubleheaded arrow between horizontal lines to indicate taller scrollbox setting.',
    250
);
settingsPanel.buttonContainers['scrollerBoxHeight'].addState(
    'makeScrollerBoxTallest', 
    'images/tallest-icon.png',
    'Doubleheaded arrow between horizontal lines to indicate tallest scrollbox setting.',
    400
);
settingsPanel.buttonContainers['scrollerBoxHeight'].addState(
    'makeScrollerBoxShort', 
    'images/shortest-icon.png',
    'Doubleheaded arrow between horizontal lines to indicate shortest scrollbox setting.',
    100
);

settingsPanel.createToggleButton(
    'keypressPower', 
    'currentState',
    true // State saved to local storage
);
settingsPanel.buttonContainers['keypressPower'].addState(
    'keypressMedium', 
    'images/keypress-double-icon.png',
    'Two arrows towards left to indicate key stroke moves text more.',
    200
);
settingsPanel.buttonContainers['keypressPower'].addState(
    'keypressLarge', 
    'images/keypress-triple-icon.png',
    'Three left to indicate key stroke moves text most.',
    300
);
settingsPanel.buttonContainers['keypressPower'].addState(
    'keypressSmall', 
    'images/keypress-icon.png',
    'Arrow left to indicate key stroke moves text less.',
    100
);


settingsPanel.createToggleButton(
    'dragSpeed', 
    'currentState',
    true // State saved to local storage
);
settingsPanel.buttonContainers['dragSpeed'].addState(
    'dragSpeedFast', 
    'images/pointer-icon-double.png',
    'Double index finter icon to indicate drag ratio is two-to-one.',
    2
);
settingsPanel.buttonContainers['dragSpeed'].addState(
    'dragSpeedFastest', 
    'images/pointer-icon-triple.png',
    'Triple index finter icon to indicate drag ratio is three-to-one.',
    3
);
settingsPanel.buttonContainers['dragSpeed'].addState(
    'dragSpeedSlow', 
    'images/pointer-icon-single.png',
    'Single index finter icon to indicate drag ratio is one-to-one.',
    1
);


settingsPanel.createToggleButton(
    'autoScroll', 
    'currentState',
    true // State saved to local storage
);
settingsPanel.buttonContainers['autoScroll'].addState(
    'autoScrollFast', 
    'images/sentence-scroll-med.gif',
    'Animation of sentence scrolling quickly by to indicate fast auto-scroll',
    { scrollSpeed: 1, frameRate: 5, autoScrollTransition: 'transform linear' }, // 'autoScrollFast'
);
settingsPanel.buttonContainers['autoScroll'].addState(
    'autoScrollFastest', 
    'images/sentence-scroll-fast.gif',
    'Animation of sentence scrolling fastest by to indicate fastest auto-scroll',
    { scrollSpeed: 1.5, frameRate: 5, autoScrollTransition: 'transform linear' }, // 'autoScrollFastest'
);
settingsPanel.buttonContainers['autoScroll'].addState(
    'autoSwipeSlow', 
    'images/sentence-swipe-slow.gif',
    'Animation of sentence scrolling slowly with pointer to indicate  slow auto-swipe ',
    { scrollSpeed: 200, frameRate: 1000, autoScrollTransition: 'transform 1.0s ease-in-out' }, // 'autoSwipeSlow'
);
settingsPanel.buttonContainers['autoScroll'].addState(
    'autoSwipeFast', 
    'images/sentence-swipe-med.gif',
    'Animation of sentence scrolling fast with pointer to indicate fast auto-swipe slow',
    { scrollSpeed: 400, frameRate: 1250, autoScrollTransition: 'transform 1.5s ease-in-out' }, // 'autoSwipeFast'
);
settingsPanel.buttonContainers['autoScroll'].addState(
    'autoSwipeFastest', 
    'images/sentence-swipe-fast.gif',
    'Animation of sentence scrolling fastest with pointer to indicate fastest auto-swipe',
    { scrollSpeed: 600, frameRate: 1500, autoScrollTransition: 'transform 1.5s ease-in-out' }, // 'autoSwipeFastest'
);
settingsPanel.buttonContainers['autoScroll'].addState(
    'autoScrollSlow', 
    'images/sentence-scroll-slow.gif',
    'Animation of sentence scrolling slowly by to indicate slow auto-scroll',
    { scrollSpeed: 0.5, frameRate: 5, autoScrollTransition: 'transform linear' }, // 'autoScrollSlow'
);


// export { settingsPanel }