/**
 * @fileoverview Simple Virtual DOM for mini-framework
 * @version 0.0.1
 * @author Yeah so what
 */

/**
 * Create a virtual DOM element
 */
export function createElement(tag, attrs = {}, ...children) {
    return {
        tag,
        attrs: attrs || {},
        children: children.flat().filter(child => child != null)
    };
}

/**
 * Create a real DOM element from virtual DOM
 */
export function createRealNode(vnode) {
    // Handle text nodes
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(String(vnode));
    }
    
    // Create element
    const element = document.createElement(vnode.tag);
    
    // Set attributes and events
    Object.keys(vnode.attrs).forEach(key => {
        if (key.startsWith('on') && typeof vnode.attrs[key] === 'function') {
            // Handle events
            const eventType = key.slice(2).toLowerCase();
            element.addEventListener(eventType, vnode.attrs[key]);
        } else if (key === 'className') {
            element.className = vnode.attrs[key];
        } else if (key === 'style' && typeof vnode.attrs[key] === 'object') {
            Object.assign(element.style, vnode.attrs[key]);
        } else {
            element.setAttribute(key, vnode.attrs[key]);
        }
    });
    
    // Add children
    vnode.children.forEach(child => {
        element.appendChild(createRealNode(child));
    });
    
    return element;
}

/**
 * Update the DOM with new virtual DOM
 */
export function updateDom(container, newVNodes) {
    // Simple approach: clear and rebuild
    container.innerHTML = '';
    
    const vNodeArray = Array.isArray(newVNodes) ? newVNodes : [newVNodes];
    
    vNodeArray.forEach(vnode => {
        if (vnode) {
            container.appendChild(createRealNode(vnode));
        }
    });
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