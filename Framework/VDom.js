/**
 * @fileoverview Simple Virtual DOM for mini-framework
 * 
 * WHAT IS VIRTUAL DOM?
 * Virtual DOM is like making a blueprint before building a house:
 * 
 * 1. Instead of directly changing HTML on the webpage (slow and messy)
 * 2. We first create a "virtual" copy in JavaScript (fast and clean)
 * 3. Then we figure out what needs to change
 * 4. Finally we update only what's different on the real webpage
 * 
 * WHY IS THIS GOOD?
 * - Faster: We don't rebuild the whole page every time
 * - Cleaner: We can describe what we want, not how to build it
 * - Predictable: Same input always gives same output
 * 
 * HOW IT WORKS:
 * createElement() → createRealNode() → updateDom()
 * (make plan)  →  (build element)  →  (put on page)
 */

/**
 * Create a virtual DOM element - this makes a "blueprint" of an HTML element
 * 
 * Example: createElement('div', {className: 'my-class'}, 'Hello World')
 * Creates: { tag: 'div', attrs: {className: 'my-class'}, children: ['Hello World'] }
 * 
 * This blueprint will later become: <div class="my-class">Hello World</div>
 */
export function createElement(tag, attrs = {}, ...children) {
    return {
        tag,           // What HTML tag? (div, p, h1, etc.)
        attrs: attrs || {},  // What properties? (class, id, onclick, etc.)
        children: children.flat().filter(child => child != null)  // What goes inside?
    };
}

/**
 * Create a real DOM element from virtual DOM blueprint
 * 
 * This is where we take our "blueprint" and actually build the real HTML element
 * that goes on the webpage. Like turning architectural plans into an actual house.
 */
export function createRealNode(vnode) {
    // Step 1: Handle simple text (like "Hello World")
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(String(vnode));
    }
    
    // Step 2: Create the HTML element (like <div>, <p>, <h1>)
    const element = document.createElement(vnode.tag);
    
    // Step 3: Add all the properties (class, id, onclick, etc.)
    Object.keys(vnode.attrs).forEach(key => {
        if (key.startsWith('on') && typeof vnode.attrs[key] === 'function') {
            // Handle events like onclick, onchange
            const eventType = key.slice(2).toLowerCase(); // 'onclick' becomes 'click'
            element.addEventListener(eventType, vnode.attrs[key]);
        } else if (key === 'className') {
            // Handle CSS classes
            element.className = vnode.attrs[key];
        } else if (key === 'style' && typeof vnode.attrs[key] === 'object') {
            // Handle inline styles
            Object.assign(element.style, vnode.attrs[key]);
        } else if (key === 'checked') {
            // Handle checkbox checked state properly
            element.checked = vnode.attrs[key];
        } else if (key === 'value') {
            // Handle input values properly
            element.value = vnode.attrs[key];
        } else if (key === 'autofocus') {
            // Handle autofocus properly
            if (vnode.attrs[key]) {
                setTimeout(() => element.focus(), 0);
            }
        } else {
            // Handle regular attributes like id, placeholder, etc.
            element.setAttribute(key, vnode.attrs[key]);
        }
    });
    
    // Step 4: Add all the children (things that go inside this element)
    vnode.children.forEach(child => {
        element.appendChild(createRealNode(child)); // Recursive: build each child
    });
    
    return element; // Return the finished HTML element
}

/**
 * Update the DOM with new virtual DOM
 * 
 * This is the main function that updates what you see on the webpage.
 * It takes the new "blueprints" and rebuilds the webpage to match.
 * 
 * Think of it like: "Here's the new plan for how the page should look - make it happen!"
 */
export function updateDom(container, newVNodes) {
    // Make sure we have an array to work with
    const vNodeArray = Array.isArray(newVNodes) ? newVNodes : [newVNodes];
    
    // Get existing children
    const existingChildren = Array.from(container.children);
    
    // Try intelligent diffing first
    if (existingChildren.length === vNodeArray.length) {
        let canUpdateInPlace = true;
        
        // Check if we can update in place by comparing top-level structure
        for (let i = 0; i < vNodeArray.length; i++) {
            const vnode = vNodeArray[i];
            const existing = existingChildren[i];
            
            if (!vnode || !existing || 
                existing.tagName.toLowerCase() !== vnode.tag.toLowerCase() ||
                existing.className !== (vnode.attrs?.className || '')) {
                canUpdateInPlace = false;
                break;
            }
        }
        
        if (canUpdateInPlace) {
            // Update each element in place
            vNodeArray.forEach((vnode, index) => {
                if (vnode) {
                    updateElementInPlace(existingChildren[index], vnode);
                }
            });
            return;
        }
    }
    
    // Fallback: clear everything and rebuild from scratch
    container.innerHTML = '';
    
    // Build each new element and add it to the page
    vNodeArray.forEach(vnode => {
        if (vnode) {
            container.appendChild(createRealNode(vnode)); // Turn blueprint into real HTML
        }
    });
}

/**
 * Update an existing DOM element in place with new virtual DOM data
 */
function updateElementInPlace(element, vnode) {
    // Special handling for todo list container
    if (element.tagName === 'UL' && element.classList.contains('todo-list')) {
        updateTodoList(element, vnode);
        return;
    }
    
    // Update basic attributes
    if (vnode.attrs) {
        Object.keys(vnode.attrs).forEach(key => {
            if (key.startsWith('on')) {
                // Skip event handlers - they're already attached
                return;
            } else if (key === 'className') {
                if (element.className !== vnode.attrs[key]) {
                    element.className = vnode.attrs[key];
                }
            } else if (key === 'style' && typeof vnode.attrs[key] === 'string') {
                element.setAttribute('style', vnode.attrs[key]);
            }
        });
    }
    
    // Update text content for simple elements
    if (vnode.children.length === 1 && typeof vnode.children[0] === 'string') {
        if (element.textContent !== vnode.children[0]) {
            element.textContent = vnode.children[0];
        }
    } else if (vnode.children.length > 0) {
        // For complex children, recursively update or rebuild
        const existingChildElements = Array.from(element.children);
        
        if (existingChildElements.length === vnode.children.length) {
            // Try to update children in place
            vnode.children.forEach((childVNode, index) => {
                const existingChild = existingChildElements[index];
                if (existingChild && typeof childVNode === 'object' && 
                    existingChild.tagName.toLowerCase() === childVNode.tag.toLowerCase()) {
                    updateElementInPlace(existingChild, childVNode);
                } else {
                    // Replace this child
                    element.replaceChild(createRealNode(childVNode), existingChild);
                }
            });
        } else {
            // Different number of children, rebuild
            element.innerHTML = '';
            vnode.children.forEach(child => {
                element.appendChild(createRealNode(child));
            });
        }
    }
}

/**
 * Smart update for todo list - only updates changed items by ID
 */
function updateTodoList(ul, vnode) {
    const existingItems = Array.from(ul.children); // Current <li> elements
    const newItems = vnode.children; // New virtual <li> elements
    
    // Create maps for efficient lookup
    const existingById = new Map();
    existingItems.forEach(li => {
        const id = li.getAttribute('data-id');
        if (id) {
            existingById.set(id, li);
        }
    });
    
    const newById = new Map();
    newItems.forEach(vli => {
        const id = vli.attrs?.['data-id'];
        if (id) {
            newById.set(id, vli);
        }
    });
    
    // Remove items that no longer exist
    existingById.forEach((li, id) => {
        if (!newById.has(id)) {
            li.remove();
        }
    });
    
    // Update existing items and add new ones
    newItems.forEach((vli, index) => {
        const id = vli.attrs?.['data-id'];
        if (!id) return;
        
        const existingLi = existingById.get(id);
        
        if (existingLi) {
            // Update this specific todo item
            updateTodoItem(existingLi, vli);
            
            // Ensure correct position
            const currentIndex = Array.from(ul.children).indexOf(existingLi);
            if (currentIndex !== index) {
                if (index >= ul.children.length) {
                    ul.appendChild(existingLi);
                } else {
                    ul.insertBefore(existingLi, ul.children[index]);
                }
            }
        } else {
            // Create new item
            const newLi = createRealNode(vli);
            if (index >= ul.children.length) {
                ul.appendChild(newLi);
            } else {
                ul.insertBefore(newLi, ul.children[index]);
            }
        }
    });
}

/**
 * Update a specific todo item (li element) in place
 */
function updateTodoItem(li, vli) {
    const newClassName = vli.attrs?.className || '';
    const currentClassName = li.className;
    
    // Update class name (this handles editing/completed states)
    if (currentClassName !== newClassName) {
        li.className = newClassName;
    }
    
    // Check if editing state changed
    const wasEditing = currentClassName.includes('editing');
    const isEditing = newClassName.includes('editing');
    
    if (wasEditing !== isEditing) {
        // Editing state changed - need to rebuild content
        li.innerHTML = '';
        vli.children.forEach(child => {
            li.appendChild(createRealNode(child));
        });
        
        // Auto-focus edit input if entering edit mode
        if (isEditing) {
            requestAnimationFrame(() => {
                const editInput = li.querySelector('.edit');
                if (editInput) {
                    editInput.focus();
                    editInput.select();
                }
            });
        }
    } else {
        // Same editing state - update specific parts
        updateTodoItemContent(li, vli);
    }
}

/**
 * Update specific parts of a todo item without rebuilding
 */
function updateTodoItemContent(li, vli) {
    // Update label text
    const label = li.querySelector('label');
    const newLabelText = findLabelTextInVNode(vli);
    if (label && newLabelText && label.textContent !== newLabelText) {
        label.textContent = newLabelText;
    }
    
    // Update checkbox state
    const checkbox = li.querySelector('.toggle');
    const newCheckedState = findCheckboxStateInVNode(vli);
    if (checkbox && checkbox.checked !== newCheckedState) {
        checkbox.checked = newCheckedState;
    }
}

/**
 * Helper to find label text in virtual node tree
 */
function findLabelTextInVNode(vnode) {
    if (vnode.tag === 'label' && vnode.children.length > 0) {
        return vnode.children[0];
    }
    if (vnode.children) {
        for (const child of vnode.children) {
            if (typeof child === 'object') {
                const result = findLabelTextInVNode(child);
                if (result) return result;
            }
        }
    }
    return null;
}

/**
 * Helper to find checkbox checked state in virtual node tree
 */
function findCheckboxStateInVNode(vnode) {
    if (vnode.tag === 'input' && vnode.attrs?.type === 'checkbox') {
        return !!vnode.attrs.checked;
    }
    if (vnode.children) {
        for (const child of vnode.children) {
            if (typeof child === 'object') {
                const result = findCheckboxStateInVNode(child);
                if (result !== null) return result;
            }
        }
    }
    return false;
}

/**
 * JSX-like helper
 */
export function h(tag, props, ...children) {
    return createElement(tag, props, ...children);
}

/**
 * Compatibility function for TodoApp
 */
export function createVirtualElement(tag, attrs = {}, textContent = "", children = []) {
    if (textContent && children.length === 0) {
        return createElement(tag, attrs, textContent);
    }
    if (children.length > 0) {
        return createElement(tag, attrs, ...children);
    }
    return createElement(tag, attrs);
}

/**
 * Focus an element by selector
 */
export function focusElement(selector, position = 'start') {
    setTimeout(() => {
        const element = document.querySelector(selector);
        if (element) {
            element.focus();
            
            if (element.type === 'text' || element.type === 'textarea') {
                if (position === 'end') {
                    element.setSelectionRange(element.value.length, element.value.length);
                } else {
                    element.setSelectionRange(0, 0);
                }
            }
        }
    }, 0);
}