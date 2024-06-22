// scripts/classes/Overlay.js

(function () {
    class ScrollerOverlay {
      constructor() {
        this.isIphone = false;
        this.queryForIphone();
        this.scrollerOverlayHTML = this.createHTMLContainer();

        // Repositioning Logic
        this.dragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.overlayStartX = 0;
        this.overlayStartY = 0;
        this.addDragListeners();

        // Resize Logic
        this.resizing = false;
        this.resizeStartX = 0;
        this.resizeStartY = 0;
        this.overlayStartWidth = 0;
        this.overlayStartHeight = 0;
        this.overlayStartLeft = 0;
        this.overlayStartTop = 0;
        this.addResizeListeners();
      }

      queryForIphone() {
        // Attempt two methods to check if device is iphone
        if (/iPhone/.test(navigator.userAgent)) this.isIphone = true;

        const mediaQuery = window.matchMedia(
          "(max-width: 767px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)"
        );
        if (mediaQuery.matches) this.isIphone = true;
      }

      createHTMLContainer() {
        // Add Google Fonts links to the head
        const head = document.head;

        const link1 = document.createElement("link");
        link1.rel = "preconnect";
        link1.href = "scrollerOverlay.css";
        head.appendChild(link1);

        const link2 = document.createElement("link");
        link2.rel = "preconnect";
        link2.href = "https://fonts.googleapis.com";
        head.appendChild(link2);

        const link3 = document.createElement("link");
        link3.rel = "preconnect";
        link3.href = "https://fonts.gstatic.com";
        link3.crossOrigin = "anonymous";
        head.appendChild(link3);

        const link4 = document.createElement("link");
        link4.rel = "stylesheet";
        link4.href =
          "https://fonts.googleapis.com/css2?family=Noto+Serif+TC&display=swap";
        head.appendChild(link4);

        // Create HTML structure
        const overlayHarness = document.createElement("div");
        overlayHarness.id = "scrollerOverlayContainer";
        // overlayHarness.classList.add('unselectable');
        // overlayHarness.draggable = "true";

        const toolbarContainer = document.createElement("div");
        toolbarContainer.id = "toolbar";
        toolbarContainer.classList.add("button-panel");

        const toolbarOpenCloseContainer = document.createElement("div");

        const toolbarOpenButton = document.createElement("button");
        toolbarOpenButton.classList.add("open");

        const toolbarOpenImg = document.createElement("img");
        const hammerIcon = chrome.runtime.getURL("images/hammer-icon.png");
        toolbarOpenImg.id = "toolIcon";
        toolbarOpenImg.src = hammerIcon;
        toolbarOpenImg.classList.add("unselectable");
        toolbarOpenImg.alt = "Hammer icon to indicate tools";

        toolbarOpenButton.appendChild(toolbarOpenImg);

        const toolbarCloseButton = document.createElement("button");
        toolbarCloseButton.classList.add("close", "hidden");

        const toolbarCloseImg = document.createElement("img");
        const hammerIconActive = chrome.runtime.getURL(
          "images/hammer-icon-active.gif"
        );
        toolbarCloseImg.id = "settingsIconActive";
        toolbarCloseImg.src = hammerIconActive;
        toolbarCloseImg.classList.add("unselectable");
        toolbarCloseImg.alt =
          "Jiggling hammer icon to indicate setting are open";

        toolbarCloseButton.appendChild(toolbarCloseImg);

        toolbarOpenCloseContainer.appendChild(toolbarOpenButton);
        toolbarOpenCloseContainer.appendChild(toolbarCloseButton);

        const externalDivider = document.createElement("div");
        externalDivider.id = "externalDivider";
        externalDivider.classList.add("hidden");

        const dividerIcon = chrome.runtime.getURL("images/divider-icon.png");
        const externalDividerIcon = document.createElement("img");
        externalDividerIcon.src = dividerIcon;

        const externalDividerContainer = document.createElement("div");
        externalDividerContainer.classList.add("button-divider");
        externalDividerContainer.appendChild(externalDividerIcon);

        externalDivider.appendChild(externalDividerContainer);

        const nestedButtonsContainer = document.createElement("div");
        nestedButtonsContainer.classList.add("nested-buttons");

        const internalDivider = document.createElement("div");
        internalDivider.id = "internalDivider";
        internalDivider.classList.add(
          "toggle-button-container",
          "hidden-setting"
        );
        internalDivider.draggable = true;

        const internalDividerIcon = document.createElement("img");
        internalDividerIcon.src = dividerIcon;

        const internalDividerContainer = document.createElement("div");
        internalDividerContainer.classList.add("button-divider");
        internalDividerContainer.appendChild(internalDividerIcon);

        internalDivider.appendChild(internalDividerContainer);
        nestedButtonsContainer.appendChild(internalDivider);

        toolbarContainer.appendChild(toolbarOpenCloseContainer);
        toolbarContainer.appendChild(externalDivider);
        toolbarContainer.appendChild(nestedButtonsContainer);

        const textScroller = document.createElement("div");
        textScroller.classList.add("text-wrapper");

        const text = document.createElement("div");
        text.id = "text";
        text.classList.add("unselectable");
        text.innerHTML = `<!-- IMPORTANT NOTE: This is filled when TextScroller object is instantiated. However, the '...' below forces font-family styles to be active before the first mapping of text. Others, text will be incorretly meeasured -->`;

        textScroller.appendChild(text);

        const settingsContainer = document.createElement("div");
        settingsContainer.id = "settings";
        settingsContainer.classList.add("button-panel");

        const settingsOpenCloseContainer = document.createElement("div");

        const settingsOpenButton = document.createElement("button");
        settingsOpenButton.classList.add("open");

        const settingsOpenImg = document.createElement("img");
        const settingGearIcon = chrome.runtime.getURL(
          "images/setting-gear-icon.png"
        );
        settingsOpenImg.id = "settingsIcon";
        settingsOpenImg.src = settingGearIcon;
        settingsOpenImg.classList.add("unselectable");
        settingsOpenImg.alt = "Gear icon to indicate settings";

        settingsOpenButton.appendChild(settingsOpenImg);

        const settingsCloseButton = document.createElement("button");
        settingsCloseButton.classList.add("close", "hidden");

        const settingsCloseImg = document.createElement("img");
        const settingGearIconActive = chrome.runtime.getURL(
          "images/spinning-setting-gear-icon.gif"
        );
        settingsCloseImg.id = "settingsIconActive";
        settingsCloseImg.src = settingGearIconActive;
        settingsCloseImg.classList.add("unselectable");
        settingsCloseImg.alt =
          "Spinning gear icon to indicate setting are open";

        settingsCloseButton.appendChild(settingsCloseImg);

        settingsOpenCloseContainer.appendChild(settingsOpenButton);
        settingsOpenCloseContainer.appendChild(settingsCloseButton);

        const settingsExternalDivider = document.createElement("div");
        settingsExternalDivider.id = "externalDivider";
        settingsExternalDivider.classList.add("hidden");

        const settingsExternalDividerIcon = document.createElement("img");
        settingsExternalDividerIcon.src = dividerIcon;

        const settingsExternalDividerContainer = document.createElement("div");
        settingsExternalDividerContainer.classList.add("button-divider");
        settingsExternalDividerContainer.appendChild(
          settingsExternalDividerIcon
        );

        settingsExternalDivider.appendChild(settingsExternalDividerContainer);

        const settingsNestedButtonsContainer = document.createElement("div");
        settingsNestedButtonsContainer.classList.add("nested-buttons");

        const settingsInternalDivider = document.createElement("div");
        settingsInternalDivider.id = "internalDivider";
        settingsInternalDivider.classList.add(
          "toggle-button-container",
          "hidden-setting"
        );
        settingsInternalDivider.draggable = true;

        const settingsInternalDividerIcon = document.createElement("img");
        settingsInternalDividerIcon.src = dividerIcon;

        const settingsInternalDividerContainer = document.createElement("div");
        settingsInternalDividerContainer.classList.add("button-divider");
        settingsInternalDividerContainer.appendChild(
          settingsInternalDividerIcon
        );

        settingsInternalDivider.appendChild(settingsInternalDividerContainer);
        settingsNestedButtonsContainer.appendChild(settingsInternalDivider);

        settingsContainer.appendChild(settingsOpenCloseContainer);
        settingsContainer.appendChild(settingsExternalDivider);
        settingsContainer.appendChild(settingsNestedButtonsContainer);

        overlayHarness.appendChild(toolbarContainer);
        overlayHarness.appendChild(textScroller);
        overlayHarness.appendChild(settingsContainer);

        // Add selectable bumpers on outside of scrollerOverlayContainer <div>
        const bumpers = ["top", "right", "bottom", "left"].map((pos) => {
          const bumper = document.createElement("div");
          bumper.classList.add("bumper", pos);
          return bumper;
        });
        bumpers.forEach((bumper) => overlayHarness.appendChild(bumper));

        // Add selectable corners to the scrollerOverlayContainer <div></div>
        const corners = [
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
        ].map((pos) => {
          const corner = document.createElement("div");
          corner.classList.add("corner", pos);
          return corner;
        });
        corners.forEach((corner) => overlayHarness.appendChild(corner));

        return overlayHarness;
      }

      addDragListeners() {
        const bumpers = this.scrollerOverlayHTML.querySelectorAll(".bumper");

        bumpers.forEach((bumper) => {
          bumper.addEventListener("mousedown", (e) => this.startDrag(e));
        });

        // const overlay = this.scrollerOverlayHTML;
        // overlay.addEventListener("mousedown", (e) => this.startDrag(e));
      }

      startDrag(e) {
        e.preventDefault(); // Prevent default behavior to avoid text selection and other issues
        this.dragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        const rect = this.scrollerOverlayHTML.getBoundingClientRect();
        this.overlayStartX = rect.left;
        this.overlayStartY = rect.top;
        // this.scrollerOverlayHTML.style.cursor = "grabbing";

        document.addEventListener("mousemove", this.drag);
        document.addEventListener("mouseup", this.endDrag);
      }

      drag = (e) => {
        if (!this.dragging) return;
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        this.scrollerOverlayHTML.style.left = `${
          this.overlayStartX + deltaX
        }px`;
        this.scrollerOverlayHTML.style.top = `${this.overlayStartY + deltaY}px`;
      };

      endDrag = (e) => {
        if (!this.dragging) return;
        this.dragging = false;
        // this.scrollerOverlayHTML.style.cursor = "grab";

        document.removeEventListener("mousemove", this.drag);
        document.removeEventListener("mouseup", this.endDrag);
      };

      addResizeListeners() {
        const cornerBumpers = this.scrollerOverlayHTML.querySelectorAll(
          ".corner.top-left, .corner.top-right, .corner.bottom-left, .corner.bottom-right"
        );
        cornerBumpers.forEach((corner) => {
          corner.addEventListener("mousedown", (e) => this.startResize(e));
        });
      }

      startResize(e) {
        e.preventDefault();
        this.resizing = true;
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        const rect = this.scrollerOverlayHTML.getBoundingClientRect();
        this.overlayStartWidth = rect.width;
        this.overlayStartHeight = rect.height;
        this.overlayStartLeft = rect.left;
        this.overlayStartTop = rect.top;
        this.resizeDirection = e.target.classList.contains("top-left")
          ? "nw"
          : e.target.classList.contains("top-right")
          ? "ne"
          : e.target.classList.contains("bottom-left")
          ? "sw" : "se";
        document.addEventListener("mousemove", this.resize);
        document.addEventListener("mouseup", this.endResize);
      }

      resize = (e) => {
        if (!this.resizing) return;

        const deltaX = e.clientX - this.resizeStartX;
        const deltaY = e.clientY - this.resizeStartY;

        let newWidth = this.overlayStartWidth;
        let newHeight = this.overlayStartHeight;
        let newLeft = this.overlayStartLeft;
        let newTop = this.overlayStartTop;

        if (this.resizeDirection.includes('e')) newWidth += deltaX;
        if (this.resizeDirection.includes('w')) {
            newWidth -= deltaX;
            newLeft += deltaX;
        }
        if (this.resizeDirection.includes('s')) newHeight += deltaY;
        if (this.resizeDirection.includes('n')) {
            newHeight -= deltaY;
            newTop += deltaY;
        }

        if (newWidth < 400) { 
          newWidth = 400; 
          const rect = this.scrollerOverlayHTML.getBoundingClientRect();
          newLeft = rect.left;
        }
        if (newHeight < 300) { 
          newHeight = 300;
          const rect = this.scrollerOverlayHTML.getBoundingClientRect();
          newTop = rect.top;
        }

        this.scrollerOverlayHTML.style.width = `${newWidth}px`;
        this.scrollerOverlayHTML.style.height = `${newHeight}px`;
        this.scrollerOverlayHTML.style.left = `${newLeft}px`;
        this.scrollerOverlayHTML.style.top = `${newTop}px`;
      };

      endResize = (e) => {
        if (!this.resizing) return;
        this.resizing = false;
        document.removeEventListener("mousemove", this.resize);
        document.removeEventListener("mouseup", this.endResize);
      };
    }

    // Attach class to global window object
    window.ScrollerOverlay = ScrollerOverlay;
})();