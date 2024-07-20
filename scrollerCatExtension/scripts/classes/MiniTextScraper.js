class MiniTextScraper {
    constructor() {
        this.scrapedText;
    }

    async initiateScrape() {
        return new Promise((resolve, reject) => {
            
            const handleMouseUp = (e) => {
                const selection = window.getSelection();
                const selectedText = selection.toString();
                
                try {
                    if (selection.rangeCount > 0 && selectedText.trim().length > 0) {
                        this.scrapedText = selectedText;
                    }
            
                    document.removeEventListener('mouseup', handleMouseUp);
                    resolve(this.scrapedText);
                } catch (error) {
                    console.log(error.message);
                    reject(error);
                }
            
                return this.scrapedText;
            }

            document.addEventListener('mouseup', handleMouseUp);
        });
    }

    // highlightText(searchText) {
    //     const content = document.getElementById('content');
    //     this.removeHighlights();

    //     const regex = new RegExp(`(${searchText})`, 'gi');
    //     content.innerHTML = content.innerHTML.replace(regex, '<span class="scrape-highlight">$1</span>');
    // }

    // removeHighlights() {
    //     const highlightedElements = document.querySelectorAll('.scrape-highlight');
    //     highlightedElements.forEach((highlight) => {
    //         const parent = highlight.parentNode;
    //         parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
    //         parent.normalize();
    //     });
    // }
}
window.MiniTextScraper = MiniTextScraper;