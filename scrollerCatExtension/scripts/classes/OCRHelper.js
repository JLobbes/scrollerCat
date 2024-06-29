(function () {
    class OCRHelper {
        constructor() {
            this.testImage = chrome.runtime.getURL('images/OCRTestScreenshot.png');
            console.log("TestOCRBuddy initialized with testImage:", this.testImage);
        }

        async prepImage(url) {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.crossOrigin = 'Anonymous'; // allows for images from different sources, may remove
                image.src = url;
                image.onload = () => {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0, width, height);

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

        async processImage(imageData) {
            const startTime = performance.now();
            console.log("Starting image processing... at:", startTime);

            return new Promise((resolve, reject) => {
                this.createWorker()
                    .then(worker => {
                        console.log("Worker created:", worker);

                        worker.onmessage = function(event) {
                            if (event.data.error) {
                                console.error("Worker error message received:", event.data.error);
                                reject(event.data.error);
                            } else if (event.data.text) {
                                const endTime = performance.now();
                                const duration = endTime - startTime;
                                console.log(`OCR Process completed in ${duration} milliseconds.`);
                                console.log("Worker success message received:", event.data.text);
                                resolve(event.data);
                            }
                        };

                        console.log("Sending image to worker:", imageData);
                        worker.postMessage({ imageData, type: 'dataURL' });
                    })
                    .catch(error => {
                        console.error("Failed to create worker:", error);
                        reject(error);
                    });
            });
        }

        async createWorker() {
            // the below script is a mimic of scripts/tesseract/OCRworker.js, may resolve bug later, for now works with blobURL
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
        }

        initiateDragSelect() {
            const dragSelectOverlay = document.createElement('div');
            dragSelectOverlay.id = 'dragSelectOverlay';
            dragSelectOverlay.style.position = 'fixed';
            dragSelectOverlay.style.top = 0;
            dragSelectOverlay.style.left = 0;
            dragSelectOverlay.style.width = '100vw';
            dragSelectOverlay.style.height = '100vh';
            dragSelectOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            dragSelectOverlay.style.zIndex = 10000;
            dragSelectOverlay.style.cursor = 'crosshair';
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
    
                const screenshotUrl = await this.captureScreenshot();
                this.processSelectedArea(screenshotUrl, selectedArea);
            };
    
            dragSelectOverlay.addEventListener('mousedown', mouseDownHandler);
        }
    
        async captureScreenshot() {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, (response) => {
                    if (response.error) {
                        reject(response.error);
                    } else {
                        resolve(response.screenshotUrl);
                    }
                });
            });
        }

        async processSelectedArea(screenshotUrl, selectedArea) {
            const image = new Image();
            image.src = screenshotUrl;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = selectedArea.width;
                canvas.height = selectedArea.height;
                context.drawImage(image, selectedArea.x, selectedArea.y, selectedArea.width, selectedArea.height, 0, 0, selectedArea.width, selectedArea.height);
                const croppedImageUrl = canvas.toDataURL('image/png');
                this.processImage(croppedImageUrl);
            };
        }
    }

    window.OCRHelper = OCRHelper;
})();
