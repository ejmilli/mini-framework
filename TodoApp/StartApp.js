
// TodoApp application implementation using the mini-framework.
// This file contains the complete TodoApp application with state management,
// routing, and virtual DOM rendering.

import { createVirtualElement } from "../Framework/VDom.js";
import { app } from "./AppInstance.js";
import { renderHeader, renderMain, renderFooter, renderSidebar, renderInfo } from "./Render.js";
import { getFilteredTodos } from "./Utils.js";

// Sets the current todo filter and updates application state
function setFilter(filter) {
    app.setState({ filter: filter });
}

// Set up application routing with filter handlers
app
    .addRoute("/", () => setFilter("all"))
    .addRoute("/active", () => setFilter("active"))
    .addRoute("/completed", () => setFilter("completed"));

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