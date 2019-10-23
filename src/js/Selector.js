export default class Selector {
    constructor(element, options) {
        this.options = Object.assign({
            ajaxOptions: null
        }, options);
        this.wrapper = element;
        this.listOptions = new Map();
        this.inputEl = null;
        this.suggestionsEl = null;
        this.onOptionSelectedCallback = options.onOptionSelectedCallback || null;

        this.initStyle();
        this.initEvents();
    }

    initStyle() {
        this.wrapper.className = 'MultiList__Selector';

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'MultiList__Selector__Input';
        this.wrapper.appendChild(inputWrapper);

        this.inputEl = document.createElement('input');
        this.inputEl.type = 'text';
        this.inputEl.placeholder = 'Search...';
        inputWrapper.appendChild(this.inputEl);

        this.suggestionsEl = document.createElement('ul');
        this.suggestionsEl.className = 'MultiList__Selector__SuggestionsList';
        this.suggestionsEl.style.display = 'none';
        this.wrapper.appendChild(this.suggestionsEl);

        this.overlayEl = document.createElement('div');
        this.overlayEl.className = 'MultiList__Selector__Overlay';
        this.overlayEl.style.display = 'none';
        this.wrapper.appendChild(this.overlayEl);
    }

    initEvents() {
        this.inputEl.addEventListener('focus', e => {
            this.openSuggestionsDropdown();
        });
        this.overlayEl.addEventListener('click', e => {
            this.closeSuggestionsDropdown();
        });
        this.inputEl.addEventListener('keypress', e => {
            this.onKeyPress();
        });
        this.suggestionsEl.addEventListener('click', e => {
            if (e.target.nodeName !== 'LI') {
                return;
            }

            const optionId = e.target.dataset.id;
            const option = this.listOptions.get(optionId);

            this.onOptionSelected(option);
            this.closeSuggestionsDropdown();
        });
    }

    readOptionsFromInput(input) {
        this.listOptions = new Map();
        input.querySelectorAll('option').forEach(optionEl => {
            if (optionEl.selected) {
                return;
            }

            const newOption = { name: optionEl.textContent, id: optionEl.value };

            if (this.options.data) {
                this.options.data.forEach(dataKey => {
                    if (!optionEl.dataset[dataKey]) {
                        return;
                    }

                    newOption[dataKey] = optionEl.dataset[dataKey];
                });
            }

            this.listOptions.set(newOption.id, newOption);
        });

        this.renderList();
    }

    add(option) {
        this.listOptions.set(option.id, option);
        this.renderList();
    }

    renderList() {
        this.suggestionsEl.innerHTML = '';
        this.listOptions.forEach((option, key, map) => {
            const optionEl = document.createElement('li');
            optionEl.textContent = option.name;
            optionEl.dataset.id = option.id;
            this.suggestionsEl.appendChild(optionEl);
        });
    }

    openSuggestionsDropdown() {
        this.suggestionsEl.style.display = 'block';
        this.overlayEl.style.display = 'block';
    }

    closeSuggestionsDropdown() {
        this.suggestionsEl.style.display = 'none';
        this.overlayEl.style.display = 'none';
    }

    onKeyPress() {
        const searchQuery = this.inputEl.value;

        if (searchQuery === '') {
            return;
        }

        if (this.options.ajaxOptions) {
            this.options.ajaxOptions.call(this, searchQuery, results => {
                results.forEach(option => {
                    this.listOptions.set(option.id, option);
                });
                this.renderList();
            });
        }
    }

    onOptionSelected(option) {
        this.listOptions.delete(option.id);
        this.renderList();

        if (this.onOptionSelectedCallback) {
            this.onOptionSelectedCallback.call(this, option);
        }
    }
}
