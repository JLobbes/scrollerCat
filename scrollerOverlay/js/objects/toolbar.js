// import { ButtonPanel } from '/ButtonPanel.js'

const toolbar = new ButtonPanel('toolbar');

toolbar.createButton('centerText');
toolbar.buttonContainers['centerText'].setIconData(
    'images/center-icon.png',
    'Icon to indicate text centered in scrollerBox'
)

toolbar.createToggleButton(
    'userTextInput', 
    'nextState',
    false  // State not saved to local storage 
);
toolbar.buttonContainers['userTextInput'].addState(
    'pasteZoneClosed', 
    'images/curving-arrow-icon.png',
    'Arrow curving towards textScroller to indicate text will pushed to textScroller.',
    true
);  
toolbar.buttonContainers['userTextInput'].addState(
    'pasteZoneOpen', 
    'images/paste-icon.png',
    'Paste page icon to indicate open paste text textarea.',
    false
);

toolbar.createToggleButton(
    'read', 
    'nextState',
    false // State not saved to local storage
);
toolbar.buttonContainers['read'].addState(
    'stop', 
    'images/stop-icon.png',
    'Stop icon to stop auto-scroll.',
    false
);
toolbar.buttonContainers['read'].addState(
    'play', 
    'images/play-icon.png',
    'Play icon to start auto-scrollArrow curving towards textScroller to indicate text will pushed to textScroller.',
    true
);  

// export { toolbar };

// To-Do incorportate longpress mimic for mobile!!
// const element = document.getElementById('myElement');
// const longPressDuration = 1000; // 1 second

// const simulateLongPress = () => {
//     const mousedownEvent = new MouseEvent('mousedown', {
//         bubbles: true,
//         cancelable: true,
//         view: window
//     });
//     element.dispatchEvent(mousedownEvent);

//     setTimeout(() => {
//         const mouseupEvent = new MouseEvent('mouseup', {
//             bubbles: true,
//             cancelable: true,
//             view: window
//         });
//         element.dispatchEvent(mouseupEvent);
//     }, longPressDuration);
// };

// simulateLongPress();

