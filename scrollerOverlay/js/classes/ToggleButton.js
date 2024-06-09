// import { UserSetting } from 'UserSetting.js'

class ToggleButton {
    constructor(buttonType, buttonName, saveState) {
        this.name = buttonName;
        this.buttonType = buttonType; // currentState or nextState      
        // nextState ToggleButton (predictive) shows the next state if clicked. 
        // currentState ToggleButton (NOT predictive) shows the current state if clicked. Not predicitive.
        this.states = [];

        this.saveState = saveState;
        if(this.saveState) {
            // Pull saved settings from local storage
            this.buttonSetting = new UserSetting(this.name);
            const savedSetting = this.buttonSetting.loadSetting();
            this.indexOfCurrentState = savedSetting ? savedSetting : 0;
        } else {
            this.indexOfCurrentState = 0;
        }

        this.container;
    }

    addState(name, iconPath, alternateText, value) {
        const addedState = { 
            'name': name,
            'iconPath': iconPath,
            'alternateText': alternateText, 
            'value': value
        }

        this.states.push(addedState);
    }

    advanceState() {
        const nextIndex = (this.indexOfCurrentState + 1) % this.states.length;
        this.indexOfCurrentState = nextIndex;

        if(this.saveState) {
            this.buttonSetting.saveSetting(this.indexOfCurrentState);
        }
        this.updateButtonElem();
        
        try {
            this.mainFunction();
        }
        catch(error) {
            console.log(error);
        }
    }

    updateButtonElem() {
        this.container.innerHTML = '';

        const index = (this.buttonType === 'currentState') ? this.indexOfCurrentState : (this.indexOfCurrentState + 1) % this.states.length; 
        const action = this.states[index]['name'];
        const iconPath = this.states[index]['iconPath'];
        const alternateText = this.states[index]['alternateText'];

        const button = document.createElement('button');
        button.id = `${action}`;

        const img = document.createElement('img');
        img.src = `${iconPath}`;
        img.alt = `${alternateText}`;

        button.appendChild(img);
        this.container.appendChild(button);
    }

    prepareContainerElem() {
        const container = document.createElement('div');
        container.id = `${this.name}`;
        container.classList.add('toggle-button-container');
        container.classList.add('hidden-setting');
        container.setAttribute('draggable', 'true');

        container.addEventListener('click', () => {
            this.advanceState();
        });

        this.container = container;
        return container;
    }

    renderSavedState() {
        const prevIndex = (this.indexOfCurrentState - 1 + this.states.length) % this.states.length;
        this.indexOfCurrentState = prevIndex;
        this.advanceState();
    }
}

// export { ToggleButton }