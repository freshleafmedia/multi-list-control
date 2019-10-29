import List from './List';
import Selector from './Selector';

export default class MultiListControl {
    constructor(element, options) {
        const strings = Object.assign({
            searchPlaceholder: 'Search...',
            maxSelectedError: 'You cannot select more than # items'
        }, options.strings);
        this.options = Object.assign({
            ajaxOptions: null,
            maxSelected: null,
            searchDebounce: 300,
            markup: {
                item: option => `<div class="MultiList__Item"><span>${option.name}</span><span class="MultiList__Close">x</span></div>`
            },
            data: null,
        }, options);
        this.options.strings = strings;
        this.wrapper = document.createElement('div');
        this.wrapperClassName = 'MultiList';
        this.nativeInput = element;
        this.list = null;
        this.selector = null;

        this.initStyle();
        this.initState();
    }

    /**
   * Get the selected options
   * @return {Map} A Map of all the options
   */
    getSelected() {
        return this.list.getOptions();
    }

    initStyle() {
        this.nativeInput.style.display = 'none';

        this.nativeInput.parentNode.appendChild(this.wrapper);
        this.wrapper.appendChild(this.nativeInput);
        this.wrapper.className = this.wrapperClassName;

        const listEl = document.createElement('div');
        this.wrapper.appendChild(listEl);
        this.list = new List(listEl, {
            maxSelected: this.options.maxSelected,
            onOptionsChangedCallback: this.onOptionsChanged.bind(this),
            onOptionRemovedCallback: this.onOptionRemoved.bind(this),
            markup: {
                item: this.options.markup.item
            },
            data: this.options.data
        });

        const selectorEl = document.createElement('div');
        this.wrapper.appendChild(selectorEl);
        this.selector = new Selector(selectorEl, {
            onOptionSelectedCallback: this.onOptionSelected.bind(this),
            onSuggestionsLoadedCallback: this.onSuggestionsLoaded.bind(this),
            ajaxOptions: this.options.ajaxOptions,
            searchDebounce: this.options.searchDebounce,
            data: this.options.data,
            strings: {
                searchPlaceholder: this.options.strings.searchPlaceholder,
                maxSelectedError: this.options.strings.maxSelectedError
            }
        }, this);
    }

    initState() {
        this.list.readOptionsFromInput(this.nativeInput);
        this.selector.readOptionsFromInput(this.nativeInput);
    }

    onSuggestionsLoaded(options) {
        return options.filter(option => {
            return this.list.optionCanBeSelected(option);
        });
    }

    onOptionSelected(option) {
        this.list.add(option);
    }

    onOptionsChanged(options) {
        this.commitToNativeInput(options);

        if (this.list.getOptions().size >= this.options.maxSelected) {
            this.selector.disable(this.options.strings.maxSelectedError.replace('#', this.options.maxSelected));
        } else {
            this.selector.enable();
        }
    }

    onOptionRemoved(option) {
        this.selector.add(option);
    }

    commitToNativeInput(options) {
        this.nativeInput.querySelectorAll('option').forEach(optionEl => {
            optionEl.remove();
        });

        options.forEach((option, key, map) => {
            const newOptionEl = document.createElement('option');
            newOptionEl.value = option.id;
            newOptionEl.textContent = option.name;
            newOptionEl.selected = true;
            this.nativeInput.appendChild(newOptionEl);
        });
    }

    reset() {
        this.list.reset();
        this.selector.reset();
    }
}