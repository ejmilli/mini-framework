// App instance and shared state
import { createApp } from "../Framework/App.js";

// Main application instance
export const app = createApp("body");

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
