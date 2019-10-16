/**
 * Multi-List Control
 *
 * Requires: es6, querySelectorAll, NodeList.forEach, Array.prototype.forEach, Element.closest, Element.insertAdjacentElement, Map
 */
export default class MultiListControl {
  constructor(element, options) {
    this.options = Object.assign({
      ajaxOptions: null,
      markup: {
        item: option => `<div class="MultiList__Item"><span>${option.name}</span><span class="MultiList__Close">x</span></div>`
      }
    }, options);
    this.wrapper = document.createElement('div');
    this.wrapperClassName = 'MultiList';
    this.nativeInput = element;
    this.list = null;
    this.selector = null;

    this.initStyle();
    this.initState();
  }

  initStyle() {
    this.nativeInput.style.display = 'none';

    this.nativeInput.parentNode.appendChild(this.wrapper);
    this.wrapper.appendChild(this.nativeInput);
    this.wrapper.className = this.wrapperClassName;

    const listEl = document.createElement('div');
    this.wrapper.appendChild(listEl);
    this.list = new List(listEl, {
      onOptionsChangedCallback: this.onOptionsChanged.bind(this),
      onOptionRemovedCallback: this.onOptionRemoved.bind(this),
      markup: {
        item: this.options.markup.item
      }
    });

    const selectorEl = document.createElement('div');
    this.wrapper.appendChild(selectorEl);
    this.selector = new Selector(selectorEl, {
      onOptionSelectedCallback: this.onOptionSelected.bind(this),
      ajaxOptions: this.options.ajaxOptions
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

class List {
  constructor(element, options) {
    this.options = Object.assign({}, options);
    this.wrapper = element;
    this.listOptions = new Map();
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
    });
    this.optionListEl.addEventListener('dragenter', e => {
      e.preventDefault();
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
      this.dragPlaceholder.insertAdjacentElement('afterend', this.dragSource);
      if (this.dragOverDirection === 0) {
        this.reorderItemBefore(this.dragSource.dataset.id, this.dragOverTarget.dataset.id);
      } else {
        this.reorderItemAfter(this.dragSource.dataset.id, this.dragOverTarget.dataset.id);
      }
      this.removeDragPlaceholder();
    });
  }

  readOptionsFromInput(input) {
    this.listOptions.clear();
    input.querySelectorAll('option').forEach(option => {
      if (option.selected === false) {
        return;
      }

      this.listOptions.set(option.value, { name: option.textContent, id: option.value });
    });

    this.renderList();
  }

  renderList() {
    this.optionListEl.innerHTML = '';
    this.listOptions.forEach((option, key, map) => {
      const optionEl = document.createElement('li');
      optionEl.innerHTML = this.options.markup.item.call(this, option);
      optionEl.dataset.id = option.id;
      optionEl.draggable = true;
      this.optionListEl.appendChild(optionEl);
    });
  }

  add(option) {
    this.listOptions.set(option.id.toString(), option);

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
}

class Selector {
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
    input.querySelectorAll('option').forEach(option => {
      if (option.selected) {
        return;
      }

      this.listOptions.set(option.value, { name: option.textContent, id: option.value });
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
