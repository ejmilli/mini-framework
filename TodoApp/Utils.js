import { app } from "./StartApp.js";
import { focusElement } from "../Framework/VDom.js";

// Handles keydown for new todo input; adds todo on Enter if valid
function handleNewTodoKeydown(event) {
    if (event.key === "Enter" && event.target.value.trim()) {
        if (addTodo(event.target.value.trim())) {
            event.target.value = "";
            setTimeout(() => {
                focusElement(".new-todo");
            }, 0);
        }
    }
}

// Toggles all todos when the master checkbox changes
function handleToggleAll() {
    toggleAllTodos();
}

// Handles keydown during todo editing; saves on Enter, cancels on Escape
function handleEditKeydown(event, todoId) {
    if (event.key === "Enter") {
        updateTodoTitle(todoId, event.target.value);
    }
    if (event.key === "Escape") {
        app.setState({
            editingId: null,
            focusEditTodo: null,
        });
    }
}

// Returns todos filtered by the current filter ('all', 'active', 'completed')
function getFilteredTodos(todoList, filter) {
    switch (filter) {
        case "active":
            return (todoList || []).filter((todo) => !todo.completed);
        case "completed":
            return (todoList || []).filter((todo) => todo.completed);
        default:
            return todoList;
    }
}

// Adds a new todo if the title is valid (min 2 chars)
function addTodo(title) {
    if (title.length < 2) {
        return false;
    }
    const currentState = app.getState();
    const newTodo = {
        id: currentState.nextId,
        title: title,
        completed: false,
    };

    app.setState({
        todos: [...currentState.todos, newTodo],
        nextId: currentState.nextId + 1,
    });
    return true;
}

// Toggles completion status of a single todo
function toggleTodo(id) {
    const state = app.getState();
    const updatedTodos = (state.todos || []).map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    app.setState({ todos: updatedTodos });
}

// Updates a todo's title or deletes it if the new title is empty or too short
function updateTodoTitle(id, newTitle) {
    const trimmedTitle = newTitle.trim();

    if (trimmedTitle.length < 2) {
        return;
    }

    const state = app.getState();
    const updatedTodos = (state.todos || []).map((todo) =>
        todo.id === id ? { ...todo, title: trimmedTitle } : todo
    );

    app.setState({
        todos: updatedTodos,
        editingId: null,
        focusEditTodo: null,
    });
}

// Removes a todo by id
function removeTodo(id) {
    const state = app.getState();
    const updatedTodos = (state.todos || []).filter((todo) => todo.id !== id);
    app.setState({ todos: updatedTodos });
}

function editTodo(id, newTitle) {
    const trimmedTitle = newTitle.trim();
  
    if (trimmedTitle.length < 2) {
      return;
    }
  
    const state = app.getState();
    const updatedTodos = (state.todos || []).map((todo) =>
      todo.id === id ? { ...todo, title: trimmedTitle } : todo
    );
  
    app.setState({
      todos: updatedTodos,
      editingId: null,
      focusEditTodo: null,
    });
  }

// Sets editing mode for a todo and focuses its input
function startEdit(id) {
    app.setState({
        editingId: id,
        focusEditTodo: id,
    });

    setTimeout(() => {
        focusElement(".edit", "end");
    }, 0);
}

// Toggles all todos: if all are complete, mark all incomplete; else, mark all complete
function toggleAllTodos() {
    const state = app.getState();
    const allCompleted =
        (state.todos || []).length > 0 &&
        (state.todos || []).every((todo) => todo.completed);
    const updatedTodos = (state.todos || []).map((todo) => ({
        ...todo,
        completed: !allCompleted,
    }));

    app.setState({ todos: updatedTodos });
}

// Removes all completed todos
function clearCompletedTodos() {
    const state = app.getState();
    const activeTodos = (state.todos || []).filter((todo) => !todo.completed);
    app.setState({ todos: activeTodos });
}

export {
    handleNewTodoKeydown,
    handleToggleAll,
    handleEditKeydown,
    getFilteredTodos,
    addTodo,
    toggleTodo,
    updateTodoTitle,
    removeTodo,
    editTodo,
    startEdit,
    toggleAllTodos,
    clearCompletedTodos,
}