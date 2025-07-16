
// TodoApp application implementation using the mini-framework.
// This file contains the complete TodoApp application with state management,
// routing, and virtual DOM rendering.

import { createVirtualElement, focusElement } from "../Framework/VDom.js";
import { createApp } from "../Framework/App.js";
import { renderHeader, renderMain, renderFooter, renderSidebar, renderInfo } from "./Render.js";
import { getFilteredTodos } from "./Utils.js";


// Main application instance
const app = createApp("body");

// Initialize TodoMVC application state
app.setState({
    todos: [],
    filter: "all",
    nextId: 1,
    editingId: null,
    focusEditTodo: null,
});

/**
 * Todo item type definition
 * @typedef {Object} Todo
 * @property {number} id - Unique identifier for the todo
 * @property {string} title - The todo text content
 * @property {boolean} completed - Whether the todo is completed
 */

// Set up application routing with filter handlers
app
    .addRoute("/", () => setFilter("all"))
    .addRoute("/active", () => setFilter("active"))
    .addRoute("/completed", () => setFilter("completed"));

// Sets the current todo filter and updates application state
function setFilter(filter) {
    app.setState({ filter: filter });
}

// Main application render function that returns the complete UI structure
function renderApp() {
    const state = app.getState();
    const visibleTodos = getFilteredTodos(state.todos, state.filter);

    return [
        createVirtualElement("aside", { class: "learn" }, "", renderSidebar()),
        createVirtualElement("section", { class: "todoapp" }, "", [
            renderHeader(),
            renderMain(visibleTodos),
            renderFooter(),
        ]),
        renderInfo(),
    ];
}

// Initialize and start the application
// Sets the render function and initializes the app with routing
app.setRenderFunction(renderApp).init();

export { app, setFilter, renderApp };