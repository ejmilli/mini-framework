/**
 * TodoMVC Rendering Functions
 * Clean, simple rendering with your own code
 */
import { app } from "./AppInstance.js";
import { 
    addTodo, 
    toggleTodo, 
    deleteTodo, 
    clearCompleted, 
    toggleAll,
    editTodo,
    getFilteredTodos,
    getCounts 
} from "./Utils.js";
import { createElement } from "../Framework/VDom.js";

// Render the header with title and input
export function renderHeader() {
    function handleKeyDown(e) {
        if (e.key === 'Enter' && e.target.value.trim()) {
            addTodo(e.target.value.trim());
            e.target.value = '';
        }
    }

    return createElement('header', { className: 'header' },
        createElement('h1', {}, 'todos'),
        createElement('input', {
            className: 'new-todo',
            placeholder: 'What needs to be done?',
            autofocus: true,
            onkeydown: handleKeyDown
        })
    );
}

// Render the main todo list section
export function renderMain() {
    const state = app.getState();
    const filteredTodos = getFilteredTodos(state.todos, state.filter);
    
    if (!state.todos.length) {
        return createElement('main', { 
            className: 'main', 
            style: 'display: none;' 
        });
    }

    const allCompleted = state.todos.every(todo => todo.completed);

    return createElement('main', { 
        className: 'main',
        style: 'display: block;' 
    },
        createElement('div', { className: 'toggle-all-container' },
            createElement('input', {
                id: 'toggle-all',
                className: 'toggle-all',
                type: 'checkbox',
                checked: allCompleted,
                onchange: () => toggleAll()
            }),
            createElement('label', {
                className: 'toggle-all-label',
                htmlFor: 'toggle-all'
            }, 'Mark all as complete')
        ),
        createElement('ul', { className: 'todo-list' },
            ...filteredTodos.map(todo => renderTodoItem(todo))
        )
    );
}

// Render individual todo item
export function renderTodoItem(todo) {
    const state = app.getState();
    const isEditing = state.editingId === todo.id;
    
    let className = '';
    if (todo.completed) className += 'completed ';
    if (isEditing) className += 'editing ';

    function handleEdit(e) {
        if (e.key === 'Enter') {
            editTodo(todo.id, e.target.value.trim());
            app.setState({ editingId: null }); // Clear editing state
        } else if (e.key === 'Escape') {
            app.setState({ editingId: null });
        }
    }

    function startEdit() {
        app.setState({ editingId: todo.id });
    }

    const viewDiv = createElement('div', { className: 'view' },
        createElement('input', {
            className: 'toggle',
            type: 'checkbox',
            checked: todo.completed,
            onchange: () => toggleTodo(todo.id)
        }),
        createElement('label', {
            ondblclick: startEdit
        }, todo.title),
        createElement('button', {
            className: 'destroy',
            onclick: () => deleteTodo(todo.id)
        })
    );

    const children = [viewDiv];
    
    if (isEditing) {
        children.push(
            createElement('input', {
                className: 'edit',
                value: todo.title,
                onkeydown: handleEdit,
                onblur: () => app.setState({ editingId: null })
            })
        );
    }

    return createElement('li', {
        className: className.trim(),
        'data-id': todo.id
    }, ...children);
}

// Render the footer with filters and counts
export function renderFooter() {
    const state = app.getState();
    const { active, completed } = getCounts(state.todos);
    
    if (!state.todos.length) {
        return createElement('footer', { 
            className: 'footer',
            style: 'display: none;' 
        });
    }

    return createElement('footer', { 
        className: 'footer',
        style: 'display: block;' 
    },
        createElement('span', { className: 'todo-count' },
            createElement('strong', {}, active),
            ` ${active === 1 ? 'item' : 'items'} left`
        ),
        createElement('ul', { className: 'filters' },
            renderFilterLink('All', '#/', state.filter === 'all'),
            renderFilterLink('Active', '#/active', state.filter === 'active'),
            renderFilterLink('Completed', '#/completed', state.filter === 'completed')
        ),
        completed > 0 ? createElement('button', {
            className: 'clear-completed',
            onclick: () => clearCompleted()
        }, 'Clear completed') : null
    );
}

// Helper to render filter links
function renderFilterLink(text, href, isSelected) {
    return createElement('li', {},
        createElement('a', {
            href: href,
            className: isSelected ? 'selected' : ''
        }, text)
    );
}

// Render sidebar info
export function renderSidebar() {
    return createElement('aside', { className: 'learn' },
        createElement('header', {},
            createElement('h3', {}, 'Mini-Framework'),
            createElement('span', { className: 'source-links' },
                createElement('h5', {}, 'Usage'),
                createElement('a', {
                    href: 'https://github.com/JSundb/mini-framework'
                }, 'Documentation')
            )
        ),
        createElement('hr'),
        createElement('blockquote', { className: 'quote speech-bubble' },
            createElement('p', {}, 'A lightweight framework for building interactive web applications with virtual DOM creation, efficient DOM diffing, event management, client-side routing, and reactive state updates.')
        )
    );
}

// Render info footer
export function renderInfo() {
    return createElement('footer', { className: 'info' },
        createElement('p', {}, 'Double-click to edit a todo'),
        createElement('p', {},
            'Created by ',
            createElement('a', { href: '#' }, 'Your Name')
        ),
        createElement('p', {},
            'Part of ',
            createElement('a', { href: 'http://todomvc.com' }, 'TodoMVC')
        )
    );
}
