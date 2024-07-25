class OCRHelper {
    constructor() {
        this.OCROutput = [];
        this.highlightBoxes = [];
        this.errorLog = []; 
        this.addEventListeners();
        this.testFunction();
        this.sitePermitsOCR;
        this.knownGlobalErrors = [
            'violates the following Content Security Policy',
            "Failed to execute 'importScripts'",
            'Refused to load the script',
        ];
        console.log("OCRHelper initialized");
    }

    addEventListeners() {
        document.addEventListener('currentWordReport', this.highlightTargetWord.bind(this));

        window.addEventListener('error', (event) => {
            this.knownGlobalErrors.forEach((errorSnippet) => {
                if (event.message.includes(errorSnippet)) {
                    console.error("Global error caught:", event.message);
                    this.sitePermitsOCR = false;
                    this.hideDragSelectButton();
                    this.errorLog.push("CSP issue: " + event.message);
                    console.log("Site Permits OCR:", this.sitePermitsOCR);
                }
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error("Unhandled promise rejection caught:", event.reason);
            if (event.reason && event.reason.message && event.reason.message.includes('violates the following Content Security Policy')) {
                this.errorLog.push("CSP issue: " + event.reason.message);
            }
        });
    }

    async testFunction() {
        // throw a junk image through the OCR pathway to see if the visited site 
        // blocks OCR for any relevant reason (e.g., CDN call, CSP source origin issues, Blob URLs, etc.)

        try {
            const screenshotUrl = await this.captureScreenshot();
            await this.processSelectedArea(screenshotUrl, { x: 0, y: 0, width: 100, height: 100 });
            this.sitePermitsOCR = true;
            this.removeHighlights();
            console.log("Site Permits OCR:", this.sitePermitsOCR);
        } catch (error) {
            this.sitePermitsOCR = false;
            this.hideDragSelectButton();
            console.log("Site Permits OCR:", this.sitePermitsOCR);
        }
    }

    hideDragSelectButton() {
        // this prevents the user from triggering OCR on sites that don't permit it
        // attempting to use OCR won't crash anything but is a nuisance.
        document.getElementById('dragSelect').remove();
    }

    async prepImage(url) {
        // imagePrep is currently unused, may include during optimization portion.
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'Anonymous'; // allows for images from different sources, may remove
            image.src = url;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                // convert to grayscale
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3; 
                    data[i] = data[i + 1] = data[i + 2] = avg; // sets red, green, & blue to average value
                }
                context.putImageData(imageData, 0, 0);

                const grayImageData = canvas.toDataURL('image/png');
                resolve(grayImageData);
            };
            image.onerror = reject;
        });
    }

    async processImage(imageData, selectedArea) {
        const startTime = performance.now();
        console.log("Starting image processing...");
    
        return new Promise((resolve, reject) => {
            this.createWorker()
                .then(worker => {
                    worker.onmessage = (event) => {
                        if (event.data.error) {
                            console.error("Worker error message received:", event.data.error);
                            this.errorLog.push(event.data.error);
                            reject(event.data.error);
                        } else if (event.data.text) {
                            const processingTime = performance.now() - startTime;
                            console.log(`OCR Process completed in ${processingTime} milliseconds.`);
    
                            const filteredOutput = this.filterForOCRConfidence(event.data);
                            this.OCROutput.unshift(filteredOutput); 
                            this.addHighlights(filteredOutput, selectedArea);
    
                            resolve(event.data);
                        }
                    };
    
                    worker.postMessage({ imageData, type: 'dataURL' });
                })
                .catch(error => {
                    console.error("Failed to create worker:", error);
                    this.errorLog.push(error.message);
                    reject(error);
                });
        });
    }    

    async createWorker() {
        try {
            const workerScript = `
                importScripts('${chrome.runtime.getURL('scripts/tesseract/tesseract.min.js')}');
                self.onmessage = async function(event) {
                    const { imageData, type } = event.data;
                    try {
                        let result;
                        if (type === 'dataURL') {
                            result = await Tesseract.recognize(imageData, 'eng', {
                                logger: m => self.postMessage({ progress: m.progress })
                            });
                        }
                        self.postMessage({ text: result.data.text, boxes: result.data.words });
                    } catch (error) {
                        self.postMessage({ error: error.message });
                    }
                };
            `;
            const blob = new Blob([workerScript], { type: 'application/javascript' });
            const blobURL = URL.createObjectURL(blob);
            return new Worker(blobURL);
        } catch (error) {
            console.error("Worker creation failed due to CSP issue:", error);
            this.errorLog.push(error.message);
            throw new Error("CSP issue: " + error.message);
        }
    }
    

    initiateDragSelect() {
        return new Promise((resolve, reject) => {
            const dragSelectOverlay = document.createElement('div');
            dragSelectOverlay.id = 'dragSelectOverlay';
            dragSelectOverlay.style.position = 'fixed';
            dragSelectOverlay.style.top = 0;
            dragSelectOverlay.style.left = 0;
            dragSelectOverlay.style.width = '100vw';
            dragSelectOverlay.style.height = '100vh';
            dragSelectOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            dragSelectOverlay.style.zIndex = 10000;
            const crosshairCursor = chrome.runtime.getURL('/images/crosshair-icon-40.png');
            dragSelectOverlay.style.cursor = `url(${crosshairCursor}), crosshair`;
            document.body.appendChild(dragSelectOverlay);
    
            let startX, startY, endX, endY, selectionBox;
    
            const mouseDownHandler = (e) => {
                startX = e.clientX;
                startY = e.clientY;
                selectionBox = document.createElement('div');
                selectionBox.id = 'selectionBox';
                selectionBox.style.position = 'absolute';
                selectionBox.style.border = '2px dashed #fff';
                selectionBox.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                selectionBox.style.left = `${startX}px`;
                selectionBox.style.top = `${startY}px`;
                dragSelectOverlay.appendChild(selectionBox);
                dragSelectOverlay.addEventListener('mousemove', mouseMoveHandler);
                dragSelectOverlay.addEventListener('mouseup', mouseUpHandler);
            };
    
            const mouseMoveHandler = (e) => {
                endX = e.clientX;
                endY = e.clientY;
                selectionBox.style.width = `${Math.abs(endX - startX)}px`;
                selectionBox.style.height = `${Math.abs(endY - startY)}px`;
                selectionBox.style.left = `${Math.min(startX, endX)}px`;
                selectionBox.style.top = `${Math.min(startY, endY)}px`;
            };
    
            const mouseUpHandler = async (e) => {
                dragSelectOverlay.removeEventListener('mousemove', mouseMoveHandler);
                dragSelectOverlay.removeEventListener('mouseup', mouseUpHandler);
                document.body.removeChild(dragSelectOverlay);
    
                const selectedArea = {
                    x: Math.min(startX, endX),
                    y: Math.min(startY, endY),
                    width: Math.abs(endX - startX),
                    height: Math.abs(endY - startY),
                };
        
                try {
                    const screenshotUrl = await this.captureScreenshot();
                    const croppedImageUrl = await this.processSelectedArea(screenshotUrl, selectedArea);
    
                    const extractedText = this.OCROutput[0].text;
                    resolve(extractedText);
                } catch (error) {
                    reject(error);
                }
            };
    
            dragSelectOverlay.addEventListener('mousedown', mouseDownHandler);
        });
    }

    async captureScreenshot() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response) => {
                if (response.error) {
                    this.errorLog.push(response.error);
                    reject(response.error);
                } else {
                    // Adjust for device pixel ratio (DPR)
                    const devicePixelRatio = window.devicePixelRatio || 1;
                    const scaledScreenshotUrl = this.scaleScreenshot(response.screenshotUrl, devicePixelRatio);
                    resolve(scaledScreenshotUrl);
                }
            });
        });
    }
    
    async scaleScreenshot(screenshotUrl, devicePixelRatio) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = screenshotUrl;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = image.width / devicePixelRatio;
                canvas.height = image.height / devicePixelRatio;
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/png'));
            };
            image.onerror = reject;
        });
    }
    

    async processSelectedArea(screenshotUrl, selectedArea) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = screenshotUrl;
            image.onload = async () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = selectedArea.width;
                canvas.height = selectedArea.height;
                context.drawImage(image, selectedArea.x, selectedArea.y, selectedArea.width, selectedArea.height, 0, 0, selectedArea.width, selectedArea.height);
                const croppedImageUrl = canvas.toDataURL('image/png');
                try {
                    await this.processImage(croppedImageUrl, selectedArea);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            image.onerror = reject;
        });
    }    

    addHighlights(tesseractOutput, selectedArea) {
        // Parse the Tesseract output to get the bounding boxes
        const words = tesseractOutput.boxes;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
        let count = 1;
        words.forEach(word => {
            const { bbox } = word;
            const { x0, y0, x1, y1 } = bbox;
    
            const adjustedX0 = x0 + selectedArea.x;
            const adjustedY0 = y0 + selectedArea.y + scrollTop;
            const adjustedX1 = x1 + selectedArea.x;
            const adjustedY1 = y1 + selectedArea.y + scrollTop;
    
            const highlightBox = document.createElement('div');
            highlightBox.className = 'tesseract-OCR-hightlights';
            highlightBox.id = `highlight-${count}`;
            count += 2; // 2 to account for the space between words in TextScroller.js wordMap
            highlightBox.style.position = 'absolute';
            highlightBox.style.left = `${adjustedX0}px`;
            highlightBox.style.top = `${adjustedY0}px`;
            highlightBox.style.width = `${adjustedX1 - adjustedX0}px`;
            highlightBox.style.height = `${adjustedY1 - adjustedY0}px`;
            highlightBox.style.backgroundColor = 'rgba(226, 165, 230, 0.3)'; // yellow for onw
            highlightBox.style.zIndex = 9998; // Ensure it appears above other elements, but not scrollerOverlay
            highlightBox.style.cursor = 'pointer';
    
            this.addHighlightClickListener(highlightBox);

            document.body.appendChild(highlightBox);
    
            this.highlightBoxes.push(highlightBox);
        });
    }
    
    removeHighlights() {
        const highlightBoxes = document.querySelectorAll('.tesseract-OCR-hightlights');
        highlightBoxes.forEach(highlight => {
            highlight.remove();
        });
    }

    addHighlightClickListener(highlightBox) {
        highlightBox.addEventListener('click', () => {
            const highlightId = highlightBox.id.split('-')[1];
            const event = new CustomEvent('scrollToWord', {
                detail: { wordId: highlightId }
            });
            document.dispatchEvent(event);
        });
    }

    defaultColorHighlights() {
        const highlightBoxes = document.querySelectorAll('.tesseract-OCR-hightlights');
        highlightBoxes.forEach(highlight => {
            highlight.style.backgroundColor = 'rgba(226, 165, 230, 0.4)';
            highlight.style.border = '';
        });
    }

    highlightTargetWord(event) {
        try {
            const targetId = event.detail.wordId;
            const targetHighlight = document.querySelector(`#highlight-${targetId}`);
            
            this.defaultColorHighlights();
            if (targetHighlight) {
                targetHighlight.style.backgroundColor = 'rgba(71, 135, 237, 0.7)';
                targetHighlight.style.border = '1px solid rgba(71, 135, 237, 1)';
            } 
        }
        catch {
            console.log('No highlights injected on the DOM yet');
        }
    }    

    filterForOCRConfidence(tesseractOutput, confidenceThreshold = 40) {
        const boxes = tesseractOutput.boxes.filter(word => word.confidence >= confidenceThreshold);
        
        let cleanText = "";
        for (const word in boxes) {
            const wordText = boxes[word].text;
            cleanText += ` ${wordText}`;
        }

        return {
            boxes: boxes,
            text: cleanText,
        };
    }

    downloadImage(dataUrl, namePrefix) {
        // This is for debug purposes only, outlived usefulness, may delete
        const now = new Date;
        const a = document.createElement('a');
        a.href = dataUrl;

        a.download = `${namePrefix} | ${now.getHours}:${now.getMinutes}:${now.getSeconds}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    borderSelectedArea(selectedArea) {
        // This is for debug purposes only, outlived usefulness, may delete
        const borderOverlay = document.createElement('div');
        borderOverlay.style.position = 'fixed';
        borderOverlay.style.border = '4px solid red';
        borderOverlay.style.left = `${selectedArea.x}px`;
        borderOverlay.style.top = `${selectedArea.y}px`;
        borderOverlay.style.width = `${selectedArea.width}px`;
        borderOverlay.style.height = `${selectedArea.height}px`;
        borderOverlay.style.zIndex = 10001; // Ensure it appears above other elements
        document.body.appendChild(borderOverlay);
    }
}

// Ensure OCRHelper is accessible in the window object
window.OCRHelper = OCRHelper;
