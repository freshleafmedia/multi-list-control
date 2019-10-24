import List from './List';
import Selector from './Selector';

export default class MultiListControl {
    constructor(element, options) {
        this.options = Object.assign({
            ajaxOptions: null,
            maxSelected: null,
            markup: {
                item: option => `<div class="MultiList__Item"><span>${option.name}</span><span class="MultiList__Close">x</span></div>`
            },
            data: null
        }, options);
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
            ajaxOptions: this.options.ajaxOptions,
            data: this.options.data
        });
    }

    initState() {
        this.list.readOptionsFromInput(this.nativeInput);
        this.selector.readOptionsFromInput(this.nativeInput);
    }

    onOptionSelected(option) {
        this.list.add(option);
    }

    onOptionsChanged(options) {
        this.commitToNativeInput(options);
    }

    onOptionRemoved(option) {
        this.selector.add(option);
    }

    commitToNativeInput(options) {
        this.nativeInput.querySelectorAll('option:checked').forEach(optionEl => {
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
}