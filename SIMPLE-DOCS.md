# Mini Framework - Simple Documentation

## Overview

This is a simplified mini-framework with 4 core components that work together to create interactive web applications.

## Framework Structure

```
Framework/
├── App.js      - Main application class
├── State.js    - State management
├── VDom.js     - Virtual DOM
└── Routing.js  - Simple routing
```

## Quick Start

```javascript
import { createApp } from './Framework/App.js';

// Create app
const app = createApp('body');

// Set initial state
app.setState({ count: 0 });

// Create render function
function render() {
    const { count } = app.getState();
    return createElement('div', {},
        createElement('h1', {}, `Count: ${count}`),
        createElement('button', {
            onclick: () => app.setState({ count: count + 1 })
        }, 'Increment')
    );
}

// Start app
app.setRenderFunction(render).init();
```

## Core Functions

### App.js
- `createApp(selector)` - Create new app
- `app.setState(newState)` - Update state
- `app.getState()` - Get current state
- `app.setRenderFunction(fn)` - Set render function
- `app.addRoute(path, handler)` - Add route
- `app.init()` - Start the app

### VDom.js
- `createElement(tag, attrs, ...children)` - Create virtual element
- `h(tag, props, ...children)` - JSX-like helper
- `updateDom(container, vdom)` - Update real DOM

### State.js
- `setState(newState)` - Update state
- `getState()` - Get current state
- `subscribe(listener)` - Listen to changes

### Routing.js
- `addRoute(path, handler)` - Add route
- `executeRoute(url)` - Execute route

## Example: Todo App

```javascript
import { createApp } from './Framework/App.js';
import { createElement } from './Framework/VDom.js';

const app = createApp('body');

app.setState({ 
    todos: [],
    filter: 'all' 
});

function addTodo(text) {
    const { todos } = app.getState();
    app.setState({
        todos: [...todos, { id: Date.now(), text, completed: false }]
    });
}

function renderTodo(todo) {
    return createElement('li', { key: todo.id },
        createElement('input', {
            type: 'checkbox',
            checked: todo.completed,
            onchange: () => toggleTodo(todo.id)
        }),
        createElement('span', {}, todo.text)
    );
}

function render() {
    const { todos, filter } = app.getState();
    
    return createElement('div', {},
        createElement('h1', {}, 'Todo App'),
        createElement('input', {
            placeholder: 'Add todo...',
            onkeydown: (e) => {
                if (e.key === 'Enter' && e.target.value) {
                    addTodo(e.target.value);
                    e.target.value = '';
                }
            }
        }),
        createElement('ul', {},
            ...todos.map(renderTodo)
        )
    );
}

app.setRenderFunction(render).init();
```

## Features

✅ **Virtual DOM** - Efficient DOM updates  
✅ **State Management** - Centralized state with automatic re-rendering  
✅ **Routing** - Hash-based navigation  
✅ **Events** - Simple event handling  
✅ **Components** - Reusable render functions  

## How It Works

1. **State Changes** trigger automatic re-renders
2. **Virtual DOM** creates JavaScript objects representing HTML
3. **Real DOM** gets updated efficiently
4. **Routing** changes state based on URL
5. **Events** update state and trigger re-renders

This creates a reactive system similar to React but much simpler!
