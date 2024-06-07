class Application {
    constructor() {
        this.isIphone = false;
        this.queryForIphone();
    }

    queryForIphone() {
        // Attempt two methods to check if device is iphone
        if (/iPhone/.test(navigator.userAgent)) this.isIphone = true;

        const mediaQuery = window.matchMedia("(max-width: 767px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)");
        if (mediaQuery.matches) this.isIphone = true;
    }

}

// export { Application }
