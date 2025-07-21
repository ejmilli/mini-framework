/**
 * TodoMVC Utility Functions
 * Simple functions for managing todos
 */
import { app } from "./AppInstance.js";

// Add a new todo
export function addTodo(text) {
    const { todos, nextId } = app.getState();
    const newTodo = {
        id: nextId,
        text: text.trim(),
        completed: false
    };
    
    app.setState({
        todos: [...todos, newTodo],
        nextId: nextId + 1
    });
}

// Toggle a todo's completed status
export function toggleTodo(id) {
    const { todos } = app.getState();
    const updatedTodos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    app.setState({ todos: updatedTodos });
}

// Delete a todo
export function deleteTodo(id) {
    const { todos } = app.getState();
    const updatedTodos = todos.filter(todo => todo.id !== id);
    
    app.setState({ todos: updatedTodos });
}

// Edit a todo's text
export function editTodo(id, newText) {
    const { todos } = app.getState();
    const updatedTodos = todos.map(todo => 
        todo.id === id ? { ...todo, text: newText.trim() } : todo
    );
    
    app.setState({ todos: updatedTodos });
}

// Toggle all todos
export function toggleAll() {
    const { todos } = app.getState();
    const allCompleted = todos.every(todo => todo.completed);
    const updatedTodos = todos.map(todo => ({ 
        ...todo, 
        completed: !allCompleted 
    }));
    
    app.setState({ todos: updatedTodos });
}

// Clear completed todos
export function clearCompleted() {
    const { todos } = app.getState();
    const activeTodos = todos.filter(todo => !todo.completed);
    
    app.setState({ todos: activeTodos });
}

// Get filtered todos based on current filter
export function getFilteredTodos() {
    const { todos, filter } = app.getState();
    
    switch (filter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Set the current filter
export function setFilter(newFilter) {
    app.setState({ filter: newFilter });
}

// Get counts for footer
export function getCounts() {
    const { todos } = app.getState();
    const active = todos.filter(todo => !todo.completed).length;
    const completed = todos.filter(todo => todo.completed).length;
    
    return { active, completed, total: todos.length };
}