export default class List {
    constructor(element, options) {
        this.options = Object.assign({
            maxSelected: null,
            data: null
        }, options);
        this.wrapper = element;
        this.listOptions = new Map();
        this.defaultListOptions = new Map();
        this.optionListEl = null;
        this.onOptionsChangedCallback = options.onOptionsChangedCallback || null;
        this.onOptionRemovedCallback = options.onOptionRemovedCallback || null;
        this.dragSource = null;
        this.dragOverTarget = null;
        this.dragOverDirection = 1;
        this.dragTimeCount = 1;
        this.dragPlaceholder = document.createElement('div');

        this.initStyle();
        this.initEvents();
    }

    initStyle() {
        this.wrapper.className = 'MultiList__List';

        this.optionListEl = document.createElement('ol');
        this.wrapper.appendChild(this.optionListEl);

        this.dragPlaceholder.className = 'MultiList__Placeholder';
    }

    initEvents() {
        this.optionListEl.addEventListener('click', e => {
            const el = e.target.closest('.MultiList__Close');
            if (!el) {
                return;
            }

            const liEl = el.closest('li');
            const optionId = liEl.dataset.id;
            const option = this.listOptions.get(optionId);

            this.onDeleteClick(option);
        });
        this.optionListEl.addEventListener('dragstart', e => {
            const dt = e.dataTransfer;
            dt.dropEffect = 'move';
            try {
                dt.setData('multilist-item', 'multilist-item');
            } catch (e) {
                dt.setData('text', 'multilist-item');
            }
            this.dragSource = e.target;
            window.requestAnimationFrame(_ => {
                this.dragPlaceholder.style.height = this.dragSource.getBoundingClientRect().height + 'px';
                this.dragSource.style.display = 'none';
                this.positionDragPlaceholder(this.dragSource, e);
            });
        });
        this.optionListEl.addEventListener('dragenter', e => {
            e.preventDefault();
            if (e.target.nodeType !== Node.ELEMENT_NODE) {
                return;
            }
            const el = e.target.closest('li');
            if (el === null || el === this.dragOverTarget) {
                return;
            }

            this.dragOverTarget = el;
            this.dragTimeCount = 1;
            this.positionDragPlaceholder(el, e);
        });
        this.optionListEl.addEventListener('dragover', e => {
            e.preventDefault();
            if (e.target.nodeType !== Node.ELEMENT_NODE) {
                return;
            }
            const el = e.target.closest('li');
            this.dragTimeCount++;
            if (el === null || this.dragTimeCount % 3 !== 0) {
                return;
            }

            this.dragOverTarget = el;
            this.positionDragPlaceholder(el, e);
        });
        this.optionListEl.addEventListener('drop', e => {
            e.preventDefault();
        });
        this.optionListEl.addEventListener('dragend', e => {
            this.dragSource.style.display = 'block';

            if (this.dragOverTarget === null) {
                this.dragSource = null;
                this.removeDragPlaceholder();
                return;
            }

            this.dragPlaceholder.insertAdjacentElement('afterend', this.dragSource);
            if (this.dragOverDirection === 0) {
                this.reorderItemBefore(this.dragSource.dataset.id, this.dragOverTarget.dataset.id);
            } else {
                this.reorderItemAfter(this.dragSource.dataset.id, this.dragOverTarget.dataset.id);
            }
            this.removeDragPlaceholder();
            this.dragSource = null;
            this.dragOverTarget = null;
        });
    }

    readOptionsFromInput(input) {
        this.listOptions.clear();
        input.querySelectorAll('option').forEach(optionEl => {
            if (optionEl.selected === false) {
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

        this.defaultListOptions = new Map(this.listOptions);
        this.onOptionsChanged();
        this.renderList();
    }

    renderList() {
        this.optionListEl.innerHTML = '';

        if (this.listOptions.size === 0) {
            const messageEl = document.createElement('div');
            messageEl.className = 'MultiList__Message';
            messageEl.textContent = this.options.strings.noneSelected;
            this.optionListEl.appendChild(messageEl);
            return;
        }

        this.listOptions.forEach((option, key, map) => {
            const optionEl = document.createElement('li');
            optionEl.innerHTML = this.options.markup.item.call(this, option);
            optionEl.dataset.id = option.id;
            optionEl.draggable = true;
            this.optionListEl.appendChild(optionEl);
        });
    }

    add(option) {
        if (this.optionCanBeSelected(option) === false) {
            return;
        }

        this.listOptions.set(String(option.id), option);

        this.onOptionsChanged();
        this.renderList();
    }

    reorderItemBefore(sourceOptionId, targetOptionId) {
        if (sourceOptionId === targetOptionId) {
            return;
        }

        const newMap = new Map();

        this.listOptions.forEach((value, key) => {
            if (key === sourceOptionId) {
                return;
            }
            if (key === targetOptionId) {
                newMap.set(sourceOptionId, this.listOptions.get(sourceOptionId));
                newMap.set(key, value);
                return;
            }
            newMap.set(key, value);
        });

        this.listOptions = newMap;

        this.onOptionsChanged();
    }

    reorderItemAfter(sourceOptionId, targetOptionId) {
        if (sourceOptionId === targetOptionId) {
            return;
        }

        const newMap = new Map();

        this.listOptions.forEach((value, key) => {
            if (key === sourceOptionId) {
                return;
            }
            if (key === targetOptionId) {
                newMap.set(key, value);
                newMap.set(sourceOptionId, this.listOptions.get(sourceOptionId));
                return;
            }
            newMap.set(key, value);
        });

        this.listOptions = newMap;

        this.onOptionsChanged();
    }

    onOptionsChanged() {
        if (this.onOptionsChangedCallback) {
            this.onOptionsChangedCallback.call(this, this.listOptions);
        }
    }

    onOptionRemoved(option) {
        if (this.onOptionRemovedCallback) {
            this.onOptionRemovedCallback.call(this, option);
        }
    }

    onDeleteClick(option) {
        this.listOptions.delete(option.id);

        this.onOptionRemoved(option);
        this.onOptionsChanged();
        this.renderList();
    }

    positionDragPlaceholder(targetEl, dragEvent) {
        const mouseY = dragEvent.offsetY;

        if (mouseY >= (targetEl.getBoundingClientRect().height / 2)) {
            targetEl.insertAdjacentElement('afterend', this.dragPlaceholder);
            this.dragOverDirection = 1;
        } else {
            targetEl.insertAdjacentElement('beforebegin', this.dragPlaceholder);
            this.dragOverDirection = 0;
        }
    }

    removeDragPlaceholder() {
        this.optionListEl.removeChild(this.dragPlaceholder);
    }

    /**
   * Get all the selected options
   * @return {Map} A Map of all the options
   */
    getOptions() {
        return this.listOptions;
    }

    /**
     * Returns true if option is selected
     * @param option
     */
    optionIsSelected(option) {
        return this.listOptions.has(option.id);
    }

    optionCanBeSelected(option) {
        return (
            (this.options.maxSelected === null || this.listOptions.size < this.options.maxSelected)
            && this.optionIsSelected(option) === false
        );
    }

    reset() {
        this.listOptions = new Map(this.defaultListOptions);
        this.onOptionsChanged();
        this.renderList();
    }
}
