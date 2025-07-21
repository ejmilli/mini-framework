/**
 * TodoMVC App Instance
 * Simple todo application using mini-framework
 */
import { createApp } from "../Framework/App.js";

// Create the main app
export const app = createApp("body");

// Set up initial state
app.setState({
    todos: [],
    filter: "all",
    nextId: 1
});
