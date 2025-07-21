
/**
 * TodoMVC Application Entry Point
 * Simple todo app built with mini-framework
 */
import { app } from "./AppInstance.js";
import { renderHeader, renderMain, renderFooter, renderSidebar, renderInfo } from "./Render.js";
import { setFilter } from "./Utils.js";
import { createElement } from "../Framework/VDom.js";

// Set up routing
app.addRoute("/", () => setFilter("all"));
app.addRoute("/active", () => setFilter("active"));
app.addRoute("/completed", () => setFilter("completed"));

// Main render function
function renderApp() {
    return [
        renderSidebar(),
        createElement('section', { className: 'todoapp' },
            renderHeader(),
            renderMain(),
            renderFooter()
        ),
        renderInfo()
    ];
}

// Start the app
app.setRenderFunction(renderApp).init();

// Export for debugging
export { app };