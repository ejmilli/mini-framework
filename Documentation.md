# Virtual DOM Documentation

## What is Virtual DOM?

The Virtual DOM is a JavaScript representation of the actual DOM (Document Object Model) that allows for efficient updates and rendering.

## How Virtual DOM Works in Mini-Framework

### 1. Virtual DOM Creation

```javascript
// Virtual DOM is just JavaScript objects
const vdom = {
  tag: "div",
  attrs: { className: "container" },
  children: [
    "Hello World",
    { tag: "button", attrs: { onclick: handler }, children: ["Click"] },
  ],
};
```

### 2. Element Creation Process

```javascript
createElement('div', { className: 'container' },
    'Hello World',
    createElement('button', { onclick: handler }, 'Click')
);

// Becomes:
{
    tag: 'div',
    attrs: { className: 'container' },
    children: [
        'Hello World',
        {
            tag: 'button',
            attrs: { onclick: handler },
            children: ['Click']
        }
    ]
}
```

### 3. DOM Diffing Algorithm

Our framework uses intelligent diffing to minimize DOM updates:

#### Smart List Updates

```javascript
// Todo list with IDs
<ul class="todo-list">
  <li data-id="1">Todo 1</li>
  <li data-id="2" class="editing">
    Todo 2
  </li> ← Only this changes
  <li data-id="3">Todo 3</li>
</ul>

// When editing Todo 2:
// ❌ Old approach: Rebuild entire list
// ✅ Our approach: Only update the specific <li> with data-id="2"
```

#### Element Identification

```javascript
function updateTodoList(ul, vnode) {
  // Map existing DOM elements by data-id
  const existingById = new Map();
  Array.from(ul.children).forEach((li) => {
    const id = li.getAttribute("data-id");
    if (id) existingById.set(id, li);
  });

  // Only update specific todo items that changed
  newItems.forEach((vli) => {
    const id = vli.attrs["data-id"];
    const existingLi = existingById.get(id);

    if (existingLi) {
      updateTodoItem(existingLi, vli); // Granular update
    } else {
      ul.appendChild(createRealNode(vli)); // New item
    }
  });
}
```

### 4. Performance Optimizations

#### In-Place Updates

```javascript
// Instead of recreating entire elements:
function updateTodoItem(li, vli) {
  // Only update what changed
  if (li.className !== vli.attrs.className) {
    li.className = vli.attrs.className; // Class change only
  }

  // Update text content without rebuilding
  const label = li.querySelector("label");
  if (label.textContent !== newText) {
    label.textContent = newText; // Text change only
  }
}
```

#### Event Preservation

```javascript
// Events stay attached during updates
const button = li.querySelector(".destroy");
// ❌ Don't recreate: button loses event listeners
// ✅ Keep existing: events remain functional
```

### 5. State Transitions

#### Edit Mode Example

```javascript
// State: editingId changes from null to 5
// Before: <li class="" data-id="5">
// After:  <li class="editing" data-id="5">

// Only the class attribute changes, everything else stays the same
updateTodoItem(existingLi, newVLi);
// Result: Smooth transition without DOM destruction
```

## Virtual DOM Benefits

1. **Performance**: Only updates what actually changed
2. **Predictability**: Same state always produces same DOM
3. **Debugging**: Easy to trace state → DOM changes
4. **Efficiency**: Batches DOM updates, reduces reflows
5. **Focus Preservation**: Edit inputs don't lose focus during updates

## Implementation Details

### CreateRealNode Function

```javascript
export function createRealNode(vnode) {
  // Handle text nodes
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  // Create DOM element
  const element = document.createElement(vnode.tag);

  // Add attributes and events
  Object.keys(vnode.attrs).forEach((key) => {
    if (key.startsWith("on")) {
      // Event listeners
      const eventType = key.slice(2).toLowerCase();
      element.addEventListener(eventType, vnode.attrs[key]);
    } else if (key === "className") {
      element.className = vnode.attrs[key];
    } else {
      element.setAttribute(key, vnode.attrs[key]);
    }
  });

  // Add children recursively
  vnode.children.forEach((child) => {
    element.appendChild(createRealNode(child));
  });

  return element;
}
```

### Update Algorithm

```javascript
export function updateDom(container, newVNodes) {
  // Try intelligent diffing first
  if (canUpdateInPlace(container, newVNodes)) {
    updateInPlace(container, newVNodes);
  } else {
    // Fallback: full rebuild
    container.innerHTML = "";
    newVNodes.forEach((vnode) => {
      container.appendChild(createRealNode(vnode));
    });
  }
}
```

## Why This Approach Works

1. **Granular Updates**: Each todo item is identified by unique ID
2. **Class-Based State**: UI state reflected in CSS classes
3. **Smart Diffing**: Compares structure before deciding update strategy
4. **Event Persistence**: Existing event listeners remain attached
5. **Focus Management**: Edit inputs maintain focus during updates

This Virtual DOM implementation provides React-level performance with much simpler code!

## How The Framework Works

### 1. Framework Architecture Overview

The mini-framework consists of 4 core modules working together:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    App.js   │    │  State.js   │    │   VDom.js   │    │ Routing.js  │
│             │    │             │    │             │    │             │
│ Application │◄──►│    State    │◄──►│ Virtual DOM │    │   Router    │
│ Lifecycle   │    │ Management  │    │ & Diffing   │    │  System     │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 2. Application Lifecycle

#### Complete Flow:

```
Initialize → Set Initial State → Render → DOM Creation → User Interaction → State Update → Re-render → DOM Update
```

#### Step-by-Step Process:

```javascript
// 1. Application Initialization
const app = createApp("#app");

// 2. Set Initial State
app.setState({ todos: [], filter: "all" });

// 3. Define Render Function
function render() {
  const state = app.getState();
  return createElement(
    "div",
    {},
    renderHeader(state),
    renderTodos(state),
    renderFooter(state)
  );
}

// 4. Start Application
app.setRenderFunction(render).init();

// 5. User Interaction Triggers State Change
// User clicks button → Event handler → setState() → Auto re-render
```

### 3. State Management Flow

#### Reactive State System:

```javascript
// When setState() is called:
app.setState({ newData: "updated" });

// Framework automatically:
// 1. Updates internal state object
// 2. Calls your render function
// 3. Creates new Virtual DOM tree
// 4. Compares with previous Virtual DOM
// 5. Updates only changed parts of real DOM
// 6. UI reflects new state immediately
```

#### State Update Process:

```javascript
// State.js implementation
export class State {
  setState(newState, triggerUpdate = true) {
    // 1. Merge new state with existing state
    this.state = { ...this.state, ...newState };

    if (triggerUpdate) {
      // 2. Notify all listeners
      this.listeners.forEach((listener) => listener(this.state));

      // 3. Trigger DOM update
      if (this.updateCallback) {
        this.updateCallback(); // This calls render()
      }
    }

    return this.state;
  }
}
```

### 4. Virtual DOM Process Deep Dive

#### From JavaScript to DOM:

```javascript
// 1. Your render function returns virtual elements
function renderTodo(todo) {
    return createElement('li', {
        className: todo.completed ? 'completed' : '',
        'data-id': todo.id
    },
        createElement('input', {
            type: 'checkbox',
            checked: todo.completed,
            onchange: () => toggleTodo(todo.id)
        }),
        createElement('span', {}, todo.text)
    );
}

// 2. createElement creates JavaScript objects
{
    tag: 'li',
    attrs: {
        className: 'completed',
        'data-id': '123'
    },
    children: [
        {
            tag: 'input',
            attrs: { type: 'checkbox', checked: true, onchange: [Function] },
            children: []
        },
        {
            tag: 'span',
            attrs: {},
            children: ['Buy groceries']
        }
    ]
}

// 3. createRealNode converts to real DOM
<li class="completed" data-id="123">
    <input type="checkbox" checked>
    <span>Buy groceries</span>
</li>
```

#### Smart Diffing Algorithm:

```javascript
// updateDom implementation
export function updateDom(container, newVNodes) {
  const existingChildren = Array.from(container.children);

  // 1. Check if we can update in place
  if (canUpdateInPlace(existingChildren, newVNodes)) {
    // 2. Update only changed elements
    newVNodes.forEach((vnode, index) => {
      updateElementInPlace(existingChildren[index], vnode);
    });
  } else {
    // 3. Fallback: full rebuild
    container.innerHTML = "";
    newVNodes.forEach((vnode) => {
      container.appendChild(createRealNode(vnode));
    });
  }
}

// Example: Only todo with ID 5 changes class
// Before: <li class="" data-id="5">
// After:  <li class="editing" data-id="5">
// Result: Only the className property is updated, everything else untouched
```

### 5. Event System Architecture

#### Event Binding Process:

```javascript
// 1. Event handlers defined in virtual DOM
createElement(
  "button",
  {
    onclick: handleClick,
    onkeydown: handleKeyPress,
  },
  "Interactive Button"
);

// 2. createRealNode attaches real event listeners
Object.keys(vnode.attrs).forEach((key) => {
  if (key.startsWith("on")) {
    const eventType = key.slice(2).toLowerCase(); // 'onclick' → 'click'
    element.addEventListener(eventType, vnode.attrs[key]);
  }
});

// 3. Event handlers have access to current state
function handleClick(event) {
  const currentState = app.getState();

  // Update state based on interaction
  app.setState({
    clickCount: currentState.clickCount + 1,
  });
  // Automatic re-render triggered
}
```

#### Event Delegation and Cleanup:

```javascript
// Smart event management during updates
function updateElementInPlace(element, vnode) {
  // Events are preserved during in-place updates
  // Only recreated when element structure changes

  if (needsEventUpdate(element, vnode)) {
    // Remove old event listeners
    cleanupEvents(element);

    // Attach new event listeners
    attachEvents(element, vnode.attrs);
  }
}
```

### 6. Component System

#### Component Pattern:

```javascript
// Components are pure functions that return virtual DOM
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  return createElement(
    "li",
    {
      className: `todo-item ${todo.completed ? "completed" : ""}`,
      "data-id": todo.id,
    },
    createElement(
      "div",
      { className: "view" },
      createElement("input", {
        className: "toggle",
        type: "checkbox",
        checked: todo.completed,
        onchange: () => onToggle(todo.id),
      }),
      createElement(
        "label",
        {
          ondblclick: () => onEdit(todo.id),
        },
        todo.title
      ),
      createElement("button", {
        className: "destroy",
        onclick: () => onDelete(todo.id),
      })
    )
  );
}

// Component composition
function TodoList({ todos, filter }) {
  const filteredTodos = getFilteredTodos(todos, filter);

  return createElement(
    "ul",
    { className: "todo-list" },
    ...filteredTodos.map((todo) =>
      TodoItem({
        todo,
        onToggle: toggleTodo,
        onDelete: deleteTodo,
        onEdit: editTodo,
      })
    )
  );
}
```

### 7. Routing System Integration

#### Hash-Based Routing:

```javascript
// Routing.js implementation
export function executeRoute(url) {
  const cleanUrl = url.startsWith("#") ? url.substring(1) : url;
  const handler = routes.get(cleanUrl) || routes.get("/");

  if (handler) {
    handler(); // Route handler updates state
  }

  // Update browser hash
  if (window.location.hash !== "#" + cleanUrl) {
    window.location.hash = cleanUrl;
  }
}

// Route handlers update application state
app.addRoute("/", () => setFilter("all"));
app.addRoute("/active", () => setFilter("active"));
app.addRoute("/completed", () => setFilter("completed"));

// State changes trigger re-renders with new filtered content
function setFilter(newFilter) {
  app.setState({ filter: newFilter });
  // Automatic re-render shows filtered todos
}
```

### 8. Performance Optimizations

#### Key Strategies:

1. **ID-Based List Updates:**

```javascript
// Each list item has unique identifier
<li data-id="123">Todo item</li>;

// Framework maps existing DOM elements by ID
const existingById = new Map();
existingItems.forEach((li) => {
  const id = li.getAttribute("data-id");
  if (id) existingById.set(id, li);
});

// Only updates specific items that changed
if (existingLi && hasChanged(existingLi, newVLi)) {
  updateTodoItem(existingLi, newVLi); // Granular update
}
```

2. **Class-Based State Transitions:**

```javascript
// UI state reflected in CSS classes
function updateTodoItem(li, vli) {
  const wasEditing = li.classList.contains("editing");
  const isEditing = vli.attrs.className?.includes("editing");

  if (wasEditing !== isEditing) {
    // State transition: rebuild content
    rebuildTodoContent(li, vli);
  } else {
    // Same state: update text/checkbox only
    updateTodoProperties(li, vli);
  }
}
```

3. **Event Preservation:**

```javascript
// Events remain attached during updates
const button = li.querySelector(".destroy");
// ✅ Button keeps its click handler
// ✅ No need to reattach event listeners
// ✅ Better performance, no memory leaks
```

### 9. Framework Benefits

#### Compared to Vanilla JavaScript:

- **Reactive Updates**: Automatic DOM updates when state changes
- **Component Reusability**: Pure functions for UI components
- **Performance**: Smart diffing minimizes DOM operations
- **Maintainability**: Clear separation of state and presentation

#### Compared to Large Frameworks:

- **Simplicity**: 4 small files, easy to understand
- **No Dependencies**: Pure JavaScript, no build tools required
- **Learning**: See exactly how frameworks work internally
- **Flexibility**: Easy to modify and extend

This architecture creates a **reactive, performant, and maintainable** system for building web applications!
