// scripts/classes/ButtonPanel.js
// uses window.Button class
// uses window.ToggleButton class

(function() {
    class ButtonPanel {
        constructor(panelId, parent) {
    
            // to stay
            this.panel = document.getElementById(panelId);
            this.openPanelButton = this.panel.querySelector('.openButtonPanel');
            this.closePanelButton = this.panel.querySelector('.closeButtonPanel');
            
            this.draggedItem;
            
            // to add
            this.containerForNested = this.panel.querySelector('.nested-buttons');
            this.buttonContainers = {};
            this.dividerIndex = 0;
            
            // to remove
            this.toggleButtonContainers;
        }
    
        addEventListeners() {
            this.openPanelButton.addEventListener('click', this.openPanel.bind(this));
            this.closePanelButton.addEventListener('click', this.closePanel.bind(this));
    
            this.toggleButtonContainers = this.panel.querySelectorAll('.toggle-button-container');
            this.toggleButtonContainers.forEach((container) => {
                container.addEventListener('dragstart', this.handleDragStart.bind(this));
                container.addEventListener('dragover', this.handleDragOver.bind(this));
                container.addEventListener('drop', this.handleDrop.bind(this));
                container.addEventListener('dragend', this.handleDragEnd.bind(this));
            });
        }
    
        createButton(buttonName) {
            const newButton = new window.Button(buttonName);
            this.buttonContainers[buttonName] = newButton;
        }
    
        // ToggleButton can be currentState or nextState 
        createToggleButton(buttonName, buttonType, saveState) {
            const newButton = new window.ToggleButton(buttonType, buttonName, saveState);
            this.buttonContainers[buttonName] = newButton;
        }
    
        loadButtonPanelHTML() {
            for (const buttonName in this.buttonContainers) {
                const buttonContainer = this.buttonContainers[buttonName];
                const HTML = buttonContainer.prepareContainerElem();
                buttonContainer.updateButtonElem();
                this.containerForNested.appendChild(HTML);
            }
        }
        
        openPanel() {
            // Start active icon animation
            this.addHiddenClass(this.openPanelButton);
            this.removeHiddenClass(this.closePanelButton);
            
            this.openNestedButtonContainers();
        }
    
        closePanel() {
            this.handlePinnedSettings();
            this.closeNestedButtonContainers();
            
            // Stop icon animation
            this.addHiddenClass(this.closePanelButton);
            this.removeHiddenClass(this.openPanelButton);
        }
    
        openNestedButtonContainers() {
            // Show nestedButton container
            const parentContainer = this.panel.querySelector('.nested-buttons');
            this.addVisibleClass(parentContainer);
        
            // Show button containers & current buttons
            this.showButtonContainers();
        }
    
        closeNestedButtonContainers() {
            // Show nestedSettings & current button with
            this.hideButtonContainers();
    
            // Hide nestedSettings container
            const parentContainer = this.panel.querySelector('.nested-buttons');
            this.removeVisibleClass(parentContainer);
        }
    
        showButtonContainers() {
            // Show toggle-button-containers
            const buttonContainers = this.panel.querySelectorAll('.toggle-button-container');
            buttonContainers.forEach((container) => {
            
                this.addVisibleClass(container); 
            });
        
            // Add special inline style for internal divider
            const internalDivider = this.panel.querySelector('#internalDivider');
            internalDivider.style.width = '25px';
            
            // remove special inline style for external divider
            const externalDivider = this.panel.querySelector('#externalDivider');
            this.addHiddenClass(externalDivider);
        }
    
        hideButtonContainers() {
            // Hide UNPINNED toggle-button-containers
            const buttonContainers = this.panel.querySelectorAll('.toggle-button-container.hidden-setting');
            buttonContainers.forEach((container) => {
                this.removeVisibleClass(container); 
            });
        
            // Remove special inline style for internal divider
            const internalDivider = this.panel.querySelector('#internalDivider');
            internalDivider.style.width = '0px';
        }
    
        handlePinnedSettings() {
            const toggleButtonContainers = this.panel.querySelectorAll('.toggle-button-container');
            
            // Get location of #internalDivider
            const divider = this.panel.querySelector('#internalDivider');
            const dividerIndex = Array.from(toggleButtonContainers).indexOf(divider);
        
            if(dividerIndex > 0) { // If divider is NOT first item
                // Add special inline style for external divider
                const externalDivider = this.panel.querySelector('#externalDivider');
                this.removeHiddenClass(externalDivider);
            }
            
            // Add hidden-setting class to containers right of divider
            toggleButtonContainers.forEach((buttonContainer) => {
                this.removeHiddenSettingClass(buttonContainer);
            const containerIndex = Array.from(toggleButtonContainers).indexOf(buttonContainer);
                if(containerIndex >= dividerIndex) {
                    this.addHiddenSettingClass(buttonContainer);
                }   
            });
        }
    
        addHiddenClass(element) {
            element.classList.add('hidden');
        }
        
        removeHiddenClass(element) {
            element.classList.remove('hidden');
        }
    
        addVisibleClass(element) {
            element.classList.add('visible');
        }
        
        removeVisibleClass(element) {
            element.classList.remove('visible');
        }
    
        addHiddenSettingClass(element) {
            element.classList.add('hidden-setting');
        }
    
        removeHiddenSettingClass(element) {
            element.classList.remove('hidden-setting');
        }
    
        handleDragStart(event) {
            this.draggedItem = event.currentTarget;
            this.draggedItem.style.opacity = '0.4'; // Reduce opacity of dragged item
            event.dataTransfer.setData('text/plain', ''); // Needed for Firefox, only dragging divider works
        }    
    
        handleDragOver(event) {
            event.preventDefault();
        }
    
        handleDrop(event) {
            event.preventDefault();
            if (this.draggedItem !== event.currentTarget) {
                const containerIndex = Array.from(this.toggleButtonContainers).indexOf(this.draggedItem);
                const droppedIndex = Array.from(this.toggleButtonContainers).indexOf(this);
                const parent = this.draggedItem.parentNode;
                if (droppedIndex <= containerIndex) {
                    parent.insertBefore(this.draggedItem, event.currentTarget);
                } else {
                    parent.insertBefore(this.draggedItem, this.nextSibling);
                }
            }
        }
    
        handleDragEnd(event) {
            this.draggedItem.style.opacity = ''; // Restore opacity
            this.draggedItem = null;
        }
    }
    
    window.ButtonPanel = ButtonPanel;
})();
