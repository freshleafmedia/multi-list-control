# Multi-List-Control

## Overview

A wrapper around a HTML multi-select to provide:

- Selecting items by adding and removing items from a visual list
- Drag and Drop ordering
- Adding suggested options via AJAX

## Install

```javascript
npm install multi-list-control
```

## Usage

```javascript
import MultiListControl from 'multi-list-control';

const el = document.querySelector('#mySelect');
new MultiListControl(el);
```

## Available Options

Specify options as an object as the second parameter e.g. `new MultiListControl(el, options)`

### ajaxOptions

**Type:** `Function` **Default:** `null`

A function executed when performing a suggestions search.

**Example:**

```javascript
new MultiListControl(el, {
  ajaxOptions: (query, callback) => {
    Axios.get('ajax?query=' + query).then(response => {
      callback(response.data);
    })
  },
});
```

### markup.item

**Type:** `Function` **Default:** `Function`

A function that returns the template used for the markup of each list item

**Example:**

```javascript
new MultiListControl(el, {
  markup: {
    item: option => `<div class="MultiList__Item"><span>${option.name}</span><span class="MultiList__Close">x</span></div>`
  }
});
```

## Supported Browsers

- Chrome
- Firefox
- Edge
- Safari
- Opera
- Internet Explorer 11