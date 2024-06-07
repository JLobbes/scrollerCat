class Button {
    constructor(buttonName) {
        this.name = buttonName;
        this.container;
        this.iconData;
    }

    setIconData(iconPath, alternateText) {
        this.iconData = {
            'iconPath': iconPath,
            'alternateText': alternateText,
        }
    }

    mainFunction() {
        console.log('No main function set.')
    }

    updateButtonElem() {
        this.container.innerHTML = '';

        const action = this.name;
        const iconPath = this.iconData['iconPath'];
        const alternateText = this.iconData['alternateText'];

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
            this.mainFunction();
        });

        this.container = container;
        return container;
    }
}

// export { Button }