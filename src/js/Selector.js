export default class Selector {
    constructor(element, options) {
        this.options = Object.assign({
            ajaxOptions: null,
            onOptionSelectedCallback: null,
            onSuggestionsLoadedCallback: null,
            searchDebounce: 300
        }, options);
        this.wrapper = element;
        this.listOptions = new Map();
        this.inputEl = null;
        this.suggestionsEl = null;
        this.loaderEl = null;

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
        this.inputEl.autocomplete = 'off';
        inputWrapper.appendChild(this.inputEl);

        this.loaderEl = document.createElement('div');
        this.loaderEl.className = 'MultiList__Selector__Loader';
        this.wrapper.appendChild(this.loaderEl);

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
            if (this.listOptions.size > 0) {
                this.openSuggestionsDropdown();
            }
        });
        this.overlayEl.addEventListener('click', e => {
            this.closeSuggestionsDropdown();
        });
        let timer = 0;
        this.inputEl.addEventListener('keyup', e => {
            window.clearTimeout(timer);
            timer = window.setTimeout(_ => {
                this.onFinishedTyping();
            }, this.options.searchDebounce);
        });
        this.inputEl.addEventListener('keypress', e => {
            if (e.keyCode === 13) {
                e.preventDefault();
            }
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

            const newOption = { name: optionEl.textContent, id: String(optionEl.value) };

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

    onFinishedTyping() {
        const searchQuery = this.inputEl.value;

        if (searchQuery === '') {
            return;
        }

        if (this.options.ajaxOptions) {
            this.showLoader();
            this.options.ajaxOptions.call(this, searchQuery, results => {
                this.hideLoader();
                this.listOptions.clear();
                results = results.map(option => {
                    option.id = String(option.id);

                    return option;
                });
                if (this.options.onSuggestionsLoadedCallback) {
                    results = this.options.onSuggestionsLoadedCallback.call(this, results);
                }
                results.forEach(option => {
                    this.listOptions.set(option.id, option);
                });
                this.renderList();
                if (this.listOptions.size > 0) {
                    this.openSuggestionsDropdown();
                } else {
                    this.closeSuggestionsDropdown();
                }
            });
        }
    }

    onOptionSelected(option) {
        this.listOptions.delete(option.id);
        this.renderList();

        if (this.options.onOptionSelectedCallback) {
            this.options.onOptionSelectedCallback.call(this, option);
        }
    }

    enable() {
        this.inputEl.disabled = false;
        this.inputEl.title = '';
    }

    disable(disabledReason) {
        this.inputEl.disabled = true;
        if (disabledReason) {
            this.inputEl.title = disabledReason;
        }
        this.closeSuggestionsDropdown();
    }

    showLoader() {
        this.loaderEl.style.display = 'block';
    }

    hideLoader() {
        this.loaderEl.style.display = 'none';
    }
}
