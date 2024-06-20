// scripts/classes/TextScroller.js
// uses window.Word class

(function () {
    class TextScroller {
        constructor(isIphone) {
            // Main DOM items
            this.scrollerBox = document.getElementsByClassName('text-wrapper')[0];
            this.scrollerText = document.getElementById('text');
            this.intialText = '...';
            this.userTextInput = '...';
            this.wordPositionMap_Array = [];
    
            // DOM item position variabless 
            this.scrollerBoxCenter;
            this.scrollerTextLeft;
            this.currentScrollPosition; // scrollerBoxLeft relative to center-line
            this.wordPostionMap_Object;
            this.visibleWords = {};
    
            // Styling variables
            this.scrollerBoxWidth = 95;   // %
            this.scrollerBoxHeight = 250; // px
            this.fontSize = 40;           // px
            
            // Drag control + movement variables
            this.translate = 0;
            this.isDown = false;
            this.cursorStartX = 0;
            this.offsetDuringDrag = 0;
            this.dragMultiplier = 3;
    
            // Keyboard control variables
            this.keyboardStep = 200;
            this.keyLeft = 'ArrowLeft';
            this.keyRight = 'ArrowRight';
            this.spaceBar = '';
    
            // Animation variables
            this.autoScrollInterval = null;
            this.scrollSpeed = 1; // pixels per interval
            this.frameRate = 5; // milliseconds
            this.scrollerTextTransition = 'transform 0s linear';
            this.autoScrollPaused = false; // used to pause autoscroll on user swipe action
    
            // Media query variables
            this.isIphone = isIphone;
    
            this.addEventListeners();
            this.applySmoothTransition();
        }
    
        addEventListeners() {
            // Drag listeners
            this.scrollerBox.addEventListener('mousedown', this.startDrag.bind(this));
            this.scrollerBox.addEventListener('touchstart', this.startDrag.bind(this), { passive: true });
            document.addEventListener('mousemove', this.doDrag.bind(this));
            document.addEventListener('touchmove', this.doDrag.bind(this), { passive: false });
            document.addEventListener('mouseup', this.endDrag.bind(this));
            document.addEventListener('touchend', this.endDrag.bind(this));
    
            // Key listeners
            document.addEventListener('keydown', this.keyboardControl.bind(this));
            
            // Boundary Assessment & Protection with delay
            const delayedAssessBoundaries = () => {
                setTimeout(() => this.assessBoundaries(), 200); // Adjust the delay time (in milliseconds) as needed
            };
    
            document.addEventListener('touchend', delayedAssessBoundaries);
            document.addEventListener('mouseup', delayedAssessBoundaries);
            document.addEventListener('keyup', delayedAssessBoundaries);
            }
    
        setInitialText(text) {
            this.intialText = text;
        }
    
        handleUserTextInput() {
            try {
                const userInputTextarea = document.getElementById('textInput');
                const userTextInput = userInputTextarea.value ? userInputTextarea.value : this.intialText;
                if (userInputTextarea) userInputTextarea.value = ''; // Clear the user-input textarea
                this.userTextInput = userTextInput;
            } 
            catch(error) {
                console.log('userInputTextarea only prepared as needed');
                const userTextInput = this.intialText;
                this.userTextInput = userTextInput;
            }
    
            this.wordPostionMap_Object = this.getWordMap(); // Measure the text in spans
    
            this.scrollerText.innerHTML = '' // Clear the newly measured spans as movement is resource 
            this.scrollerText.textContent = this.userTextInput;
    
            this.visibleWords = {...this.wordPostionMap_Object};
    
            // The following is a patch to resovle boundary protection conflict with centering text
            // To-Do: Debug
            setTimeout(() => {
                this.centerText();
            }, 50);
            
            setTimeout(() => {
                if(this.currentScrollPosition != 0) {
                    this.centerText();
                    this.assessBoundaries();
                }
            }, 1000);
    
        }
    
        prepareTextInSpan(index) {
            // Get word from mapped words
            const wordData = this.wordPostionMap_Object[index];
            const wordElement = document.createElement('span');
            wordElement.textContent = wordData.text;
            wordElement.classList.add('word');
            wordElement.id = `${JSON.stringify(wordData)}`;
            if(wordData.text === " ") {
                wordElement.style.backgroundColor = 'red';
                wordElement.innerHTML = '&nbsp;';
            }    
            return wordElement;
        }
    
        assessBoundaries() {
    
            this.getCurrentScrollPosition();
            const halfScrollerBoxWidth = this.scrollerBox.getBoundingClientRect().width / 2;
            const scrollerTextWidth = this.scrollerText.getBoundingClientRect().width;
    
            const rightBoundary = halfScrollerBoxWidth - 50; 
            if(this.currentScrollPosition > rightBoundary) { 
                this.reboundPositionTo(0);
            };
    
            const leftBoundary = -scrollerTextWidth - halfScrollerBoxWidth + 50;
            if(this.currentScrollPosition < leftBoundary) {
                this.reboundPositionTo(-scrollerTextWidth);
            }
    
            // Ensure there are words visible
            if(Object.keys(this.visibleWords).length === 0) {
                this.visibleWords = {...this.wordPostionMap_Object};
            }
            this.assessRightBoundaryWords();
            this.assessLeftBoundaryWords();
            
            // this.printVisibleWords();
        }  
        
        assessRightBoundaryWords() {
            let requiresModification;
            
            do {
                const currentWords = {...this.visibleWords};
                if (Object.keys(currentWords).length === 0) {break}; // Exit if no data to assess
        
                this.getCurrentScrollPosition();
                const halfScreenWidth = (this.scrollerBox.getBoundingClientRect().width / 2)
                const rightBoundary = -(this.currentScrollPosition) + halfScreenWidth;
                const rightMostWordKey = Object.keys(currentWords).at(-1);
                const rightMostWord = currentWords[rightMostWordKey];
                const { index, position, width } = rightMostWord;
                
                const isLastWord = index >= this.wordPositionMap_Array.length - 1;
                const isBeyondBoundary = position > rightBoundary;
                const isWithinAdditionZone = position + width < rightBoundary; 
                
                requiresModification = false;
        
                // Add text if within the addition zone and not at the last word
                if (isWithinAdditionZone && !isLastWord) {
                    this.visibleWords[(index + 1)] = this.wordPostionMap_Object[(index + 1)];  // Adds one word to visible words
                    requiresModification = true;
                }
                
                // Remove text if beyond the buffer zone
                if (isBeyondBoundary) {
                    delete this.visibleWords[index];
                    requiresModification = true;
                }
        
            } while (requiresModification);
        }    
    
        assessLeftBoundaryWords() {
            
            let requiresModification;
            
            do {
                const currentWords = {...this.visibleWords};
                if (Object.keys(currentWords).length === 0) break; // Exit if no data to assess
        
                this.getCurrentScrollPosition();
                const halfScreenWidth = (this.scrollerBox.getBoundingClientRect().width / 2)
                const leftBoundary = -(this.currentScrollPosition) - halfScreenWidth;
                const leftMostWordKey = Object.keys(currentWords).at(0); 
                const leftMostWord = currentWords[leftMostWordKey];
                const { index, position, width } = leftMostWord;
                
                const isFirstWord = index === 0;
                const isBeyondBoundary = position + width < leftBoundary;
                const isWithinAdditionZone = position > leftBoundary; 
                
                requiresModification = false;
        
                // Add text if within the addition zone and not at the last word
                if (isWithinAdditionZone && !isFirstWord) {
                    this.visibleWords[(index - 1)] = this.wordPostionMap_Object[(index - 1)];  // Adds one word to visible words
                    requiresModification = true;
                }
                
                // Remove text if beyond the buffer zone
                if (isBeyondBoundary) {
                    delete this.visibleWords[index];
                    requiresModification = true;
                }
        
            } while (requiresModification);
        }    
    
        getWordMap() {
            // Below logic is breaking text into span for measurment
    
            // Split the text into an array of letters (including spaces & Chinese characters)
            const textRaw = this.userTextInput;
    
            // Check if there are any common Chinese characters in the text as a best-guess test for Chinese
            const hasChineseCharacters = /[的一是在不了有和人這中大為上個國我以要他時來用們生到作地於出就分對成會可主發年動同工也能下過子說產種面而方後多定行學法所民得經十三之進著等部度家電力裡如水化高自二理起小物現實加量都兩體制機當使點從業本去把性好應開它合還因由其些然前外天政四日那社義事平形相全表間樣與關各重新線內數正心反你明看原又麼利比或但質氣第向道命此變條只沒結解問意建月公無系軍很情者最立代想已通並提直題黨程展五果料象員革位入常文總次品式活設及管特件長求老頭基資邊流路級少圖山統接知較將組見計別她手角期根論運農指幾九區強放決西被再做客實線名傳爭設士星車勢演熱標急嚴英奇買九該失才察步隨史權馬強草廠夜皮固屬找段油查整深轉術復職覺冷具推顯候曾觀船秀課洲孤凱印藍劃藝剛注環普奔村羅貨橋額序雅層爸房編止課怕環普奔村羅貨橋額序雅層爸房編止課怕環普奔村羅貨橋額序雅層爸房編止課怕環普奔村羅貨橋額序雅層爸房編止課怕環普奔村羅貨橋額序雅層爸房編止課怕環普奔村羅貨橋額序雅層爸房編止課怕環普奔村羅貨橋額序雅層爸房編止課怕環普奔村羅貨橋額序雅層爸房編止課怕環普奔]/.test(textRaw);
    
            // Determine the regex pattern based on the presence of Chinese characters
            const regexPattern = hasChineseCharacters
                ? /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF]|[a-zA-Z]+|\d+|[^\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DFa-zA-Z0-9\s]+|\s+/g
                : /\S+|\s+/g;
    
            const textProcessed = textRaw.match(regexPattern) || [];
    
            // Create the words array without calculating widths
            this.wordPositionMap_Array = textProcessed.map((word) => new window.Word(word, 0));
    
            // Wrap each word in a span element and add it to the scrollerText
            // Clear scrollerText and replace with words wrapped in spans
            this.scrollerText.textContent = '';
            this.scrollerText.innerHTML = this.wordPositionMap_Array
                .map((wordObj, index) => `<span class="word" id="word-${index}">${wordObj.text}</span>`)
                .join('');
    
            let position = 0;
    
            return this.wordPositionMap_Array.map((wordObj, index) => {
                // Get the word wrapped in a span from the DOM
                const wordElement = document.getElementById(`word-${index}`);
    
                // Measure the width of the word using getBoundingClientRect
                const wordRect = wordElement.getBoundingClientRect();
                let wordWidth = wordRect.width;
    
                const wordWidthScaler = {
                    // Scaling factor for mapped with on iphones
                    // fontSize: scale
                       20: 0.787727,
                       30: 0.869924,
                       40: 0.957121,
                       50: 0.999897,
                       60: 0.999721,
                }
    
                if(this.isIphone) {
                    wordWidth *= wordWidthScaler[this.fontSize];
                }
    
                // Update the width property in the word object
                wordObj.width = wordWidth;
    
                // Create word data object with position
                const wordData = {
                    index: index,
                    text: wordObj.text,
                    width: wordObj.width,
                    position
                };
    
                // Update the position for the next word
                position += wordWidth;
    
                return wordData;
            });
        };
    
        printVisibleWords() {
            let wordsInView = ''
    
            for (const key in this.visibleWords) {
                if (Object.hasOwnProperty.call(this.visibleWords, key)) {
                    const word = this.visibleWords[key];
                    wordsInView += `${word.text}`;
                }
            }
            console.log(wordsInView);   
        }
    
        jumpPositionTo(targetScrollPosition) {
            this.removeSmoothTransition();
            
            this.getCurrentScrollPosition();
            const amountMoved = targetScrollPosition - this.currentScrollPosition; 
            this.translate += amountMoved; // this.translate is for original scrolling logic, hasn't been updated
            
            this.scrollerText.style.transform = `translateX(${targetScrollPosition}px)`;
    
            // console.log(`scollerText jumped to: ${this.getCurrentScrollPosition()}`);
        }
    
        reboundPositionTo(targetScrollPosition) {
            this.endDrag();
            this.stopAutoScroll();
            this.applySmoothTransition();
            this.getCurrentScrollPosition();
            this.scrollerText.style.transform = `translateX(${targetScrollPosition}px)`;
            
            setTimeout(() => {
                this.endDrag();
                this.translate = targetScrollPosition;
                this.scrollerText.style.transform = `translateX(${targetScrollPosition}px)`;
                this.assessBoundaries();
            }, 500); // To clean up after user mouseup event sets this.translate to positive number.
        }
        
        shiftPosition(shiftAmount) {
            this.scrollerText.style.transform = `translateX(${shiftAmount}px)`;
            this.getCurrentScrollPosition();
            // this.assessBoundaries();
            
            // console.log(`scollerText shifted to: ${this.getCurrentScrollPosition()}`);
        }
    
        setDragMultiplier(multiplier) {
            this.dragMultiplier = multiplier;
        }
    
        startDrag(e) {
            if(this.autoScrollInterval != null) {
                this.autoScrollPaused = true;
                this.stopAutoScroll();
            }
            this.isDown = true;
            this.cursorStartX = ((e.pageX || e.touches[0].pageX) * this.dragMultiplier) - this.scrollerText.offsetLeft;
            this.removeSmoothTransition();
        }
        
        doDrag(e) {
            if (!this.isDown) return;
            e.preventDefault();
            const cursorEndX = ((e.pageX || e.touches[0].pageX) * this.dragMultiplier) - this.scrollerText.offsetLeft;
            const walk = cursorEndX - this.cursorStartX;
            this.shiftPosition(this.translate + walk);
            this.offsetDuringDrag = walk;
        }
        
        endDrag() {
            if(this.autoScrollPaused) {
                this.autoScrollPaused = false;
                this.startAutoScroll();
            }
            this.isDown = false;
            this.translate += this.offsetDuringDrag;
            this.offsetDuringDrag = 0;
            this.applySmoothTransition();
        }
    
        applySmoothTransition() {
            this.scrollerText.style.transition = 'transform 0.4s ease-out';
        }
    
        removeSmoothTransition() {
            this.scrollerText.style.transition = '';
        }
    
        applyAutoScrollTransition() {
            this.scrollerText.style.transition = this.scrollerTextTransition;
        }
    
        setAutoScrollConfiguration(autoScrollConfiguration) {
            this.scrollSpeed = autoScrollConfiguration.scrollSpeed;
            this.frameRate = autoScrollConfiguration.frameRate;
            this.scrollerTextTransition = autoScrollConfiguration.autoScrollTransition;
    
            // To-Do: Encapsulate and move the following transition flush and reset 
            if(this.autoScrollInterval) {
                this.stopAutoScroll();
                this.applyAutoScrollTransition();
                this.startAutoScroll()
                
            } else {
                this.stopAutoScroll(); // In order to clear interval
                this.applyAutoScrollTransition();
            }
        }
    
        keyboardControl(e) {
            this.applySmoothTransition();
            if (e.key === this.keyLeft) {
                this.translate -= this.keyboardStep;
                this.shiftPosition(this.translate);
            } else if (e.key === this.keyRight) {
                this.translate += this.keyboardStep;
                this.shiftPosition(this.translate);
            } 
        }
    
        setKeyboardStep(stepSize) {
            this.keyboardStep = stepSize; // px
        }
    
        setScrollerBoxWidth(width) {
            this.scrollerBox.style.width = `${width}%`;
        }
    
        setScrollerBoxHeight(height) {
            this.scrollerBox.style.height = `${height}px`;
        }
    
        setFontSize(fontSize) {
            // Find reference word
            this.getCurrentScrollPosition();
            const currentWords = {...this.visibleWords};
            const referenceWord = { index: 0, distanceFromCenter: 1000};
    
            for (const index in currentWords) {
                if (Object.hasOwnProperty.call(currentWords, index)) {
                    const wordData = currentWords[index];
                    const position = wordData.position;
                    const distanceOffCenter = -this.currentScrollPosition - position;
                    if(Math.abs(distanceOffCenter) < Math.abs(referenceWord.distanceFromCenter)) {
                        referenceWord.text = wordData.text;
                        referenceWord.index = wordData.index;
                        referenceWord.distanceFromCenter = distanceOffCenter;
                    }
                }
            }        
    
            // Change text size
            this.fontSize = fontSize;
            this.scrollerText.style.fontSize = `${this.fontSize}px`;
        
            // Remap text at different size
            this.wordPostionMap_Object = {};
            this.wordPostionMap_Object = this.getWordMap(); // Measure the text in spans
            // console.log(this.fontSize);
            // console.log('this.wordPositionMap:', this.wordPostionMap_Object);
    
            this.scrollerText.innerHTML = '' // Clear the newly measured spans as movement is resource 
            this.scrollerText.textContent = this.userTextInput;
    
            // Scroll until reference word is back in place
            const refWordNewData = this.wordPostionMap_Object[referenceWord.index];
            this.jumpPositionTo(-refWordNewData.position);
    
            // Readjust visible words
            this.visibleWords = {};
            this.visibleWords = {...this.wordPostionMap_Object};
            // console.log('visible words:', this.visibleWords);
    
            this.assessBoundaries();
        }
    
        getCurrentScrollPosition() {
            this.scrollerTextLeft = this.scrollerText.getBoundingClientRect().left;
            this.scrollerBoxCenter = this.scrollerBox.getBoundingClientRect().left + (this.scrollerBox.getBoundingClientRect().width / 2);
            
            this.currentScrollPosition = this.scrollerTextLeft - this.scrollerBoxCenter ;
            // console.log('currentScrollPosition updated. Now is:', this.currentScrollPosition);
            return this.currentScrollPosition;
        }
    
        centerText() {
            this.getCurrentScrollPosition(); // Update values of scrollerBoxCenter & scrollerTextLeft for accurate measurent.
            const centeringAdjustment = this.scrollerBoxCenter - this.scrollerTextLeft;
        
            // Update the translate property
            this.translate += centeringAdjustment;
            this.shiftPosition(this.translate);
        }
        
    
        toggleAutoScroll() {
            if (this.autoScrollInterval) {
                this.stopAutoScroll();
            } else {
                this.startAutoScroll();
            }
        }
    
        startAutoScroll() {
            this.autoScrollInterval = setInterval(() => {
                this.translate -= this.scrollSpeed; 
                this.removeSmoothTransition();
                this.applyAutoScrollTransition();
                this.shiftPosition(this.translate);
            }, this.frameRate); // frameRate is not FPS, but ms between animation
        }
    
        stopAutoScroll() {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }    
    }

    // Attach class to global window object
    window.TextScroller = TextScroller;
})();