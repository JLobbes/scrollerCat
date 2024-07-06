
// This script section handles making Tesseract.js from "web_accessible_resources"
// available via the Web Worker created in /scripts/OCRHelper.js.
// Currently unused, using blobURL in place of this script for now (see scripts/OCRHelper)

// only the min.js file need be imported as 
importScripts('scripts/tesseract/tesseract.min.js');
  
  // declare what happens when OCRHelper.js messages OCRWorker.js
  self.onmessage = async function(event) {
  
      // pull the image sent from the scrollerOverlay.js Web Worker
      const image = event.data;
  
      // attempt to perform OCR on the sent image using the Tesseract.js recognize function
      try {
          const result = await Tesseract.recognize(image, 'eng', {
            logger: m => self.postMessage({ progress: m.progress })
          });
          // upon success, send data back to OCRHelper.js instance
          self.postMessage({ text: result.data.text, boxes: result.data.words });
  
      } catch (error) {
        // upon fail, send error message back to scrollerOverlay.js
        self.postMessage({ error: error.message });
      }
  };