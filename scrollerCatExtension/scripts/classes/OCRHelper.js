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

                    // reduce image size if needed, may remove if this logic complicates highlights
                    const maxDimension = 1024; 
                    let width = image.width;
                    let height = image.height;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.floor(height * (maxDimension / width));
                            width = maxDimension;
                        } else {
                            width = Math.floor(width * (maxDimension / height));
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
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
    }
})();
