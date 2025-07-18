import { app } from "./StartApp.js";
import { handleNewTodoKeydown, handleToggleAll, handleEditKeydown, clearCompletedTodos, toggleTodo, editTodo, startEdit, removeTodo } from "./Utils.js";
import { createVirtualElement } from "../Framework/VDom.js";

// Renders the header section with title and new todo input
function renderHeader() {
    const state = app.getState();

    return createVirtualElement("header", { class: "header" }, "", [
        createVirtualElement("h1", {}, "todos", []),
        createVirtualElement(
            "input",
            {
                class: "new-todo",
                placeholder: "What needs to be done?",
                autofocus: "",
                onkeydown: handleNewTodoKeydown,
            },
            "",
            []
        ),
    ]);
}

// Renders the main section containing the todo list and toggle-all functionality
function renderMain(visibleTodos) {
    const state = app.getState();

    if (!state.todos || state.todos.length === 0) {
        return createVirtualElement(
            "main",
            { class: "main", style: "display: none;" },
            "",
            []
        );
    }

    const allCompleted =
        state.todos.length > 0 && state.todos.every((todo) => todo.completed);

    return createVirtualElement(
        "main",
        { class: "main", style: "display: block;" },
        "",
        [
            createVirtualElement("div", { class: "toggle-all-container" }, "", [
                createVirtualElement(
                    "input",
                    {
                        id: "toggle-all",
                        class: "toggle-all",
                        type: "checkbox",
                        checked: allCompleted,
                        onchange: handleToggleAll,
                    },
                    "",
                    []
                ),
                createVirtualElement(
                    "label",
                    {
                        class: "toggle-all-label",
                        for: "toggle-all",
                    },
                    "Mark all as complete",
                    []
                ),
            ]),
            createVirtualElement(
                "ul",
                { class: "todo-list" },
                "",
                (visibleTodos || []).map((todo) => renderTodoItem(todo))
            ),
        ]
    );
}

// Renders an individual todo item with toggle, edit, and delete functionality
function renderTodoItem(todo) {
    const state = app.getState();
    const isEditing = state.editingId === todo.id;
    const classes = [];
    if (todo.completed) classes.push("completed");
    if (isEditing) classes.push("editing");

    const children = [
        createVirtualElement("div", { class: "view" }, "", [
            createVirtualElement(
                "input",
                {
                    class: "toggle",
                    type: "checkbox",
                    checked: todo.completed,
                    onclick: () => toggleTodo(todo.id),
                },
                "",
                []
            ),
            createVirtualElement(
                "label",
                {
                    ondblclick: () => startEdit(todo.id),
                },
                todo.title,
                []
            ),
            createVirtualElement(
                "button",
                {
                    class: "destroy",
                    onclick: () => removeTodo(todo.id),
                },
                "",
                []
            ),
        ]),
    ];

    if (isEditing) {
        children.push(
            createVirtualElement(
                "input",
                {
                    class: "edit",
                    value: todo.title,
                    onkeydown: (e) => handleEditKeydown(e, todo.id),
                    onblur: () => {
                        app.setState({ editingId: null, focusEditTodo: null })
                    },
                },
                "",
                []
            )
        );
    }

    return createVirtualElement(
        "li",
        {
            "data-id": todo.id.toString(),
            class: classes.join(" "),
        },
        "",
        children
    );
}

// Renders the footer section with todo count, filters, and clear completed button
function renderFooter() {
    const state = app.getState();

    if (!state.todos || state.todos.length === 0) {
        return createVirtualElement(
            "footer",
            { class: "footer", style: "display: none;" },
            "",
            []
        );
    }

    const activeCount = (state.todos || []).filter(
        (todo) => !todo.completed
    ).length;
    const completedCount = (state.todos || []).filter(
        (todo) => todo.completed
    ).length;
    const itemText = activeCount === 1 ? "item" : "items";

    return createVirtualElement(
        "footer",
        { class: "footer", style: "display: block;" },
        "",
        [
            createVirtualElement("span", { class: "todo-count" }, "", [
                createVirtualElement("strong", {}, activeCount.toString(), []),
                createVirtualElement("span", {}, ` ${itemText} left!`, []),
            ]),
            createVirtualElement("ul", { class: "filters" }, "", [
                renderFilterLink("All", "#/", state.filter === "all"),
                renderFilterLink("Active", "#/active", state.filter === "active"),
                renderFilterLink(
                    "Completed",
                    "#/completed",
                    state.filter === "completed"
                ),
            ]),
            completedCount > 0
                ? createVirtualElement(
                    "button",
                    {
                        class: "clear-completed",
                        style: "display: block;",
                        onclick: clearCompletedTodos,
                    },
                    "Clear completed",
                    []
                )
                : createVirtualElement(
                    "button",
                    {
                        class: "clear-completed",
                        style: "display: none;",
                    },
                    "",
                    []
                ),
        ].filter(Boolean)
    );
}

// Helper function to render filter navigation links
function renderFilterLink(text, href, isSelected) {
    const linkAttributes = { href: href };
    if (isSelected) {
        linkAttributes.class = "selected";
    }

    return createVirtualElement("li", {}, "", [
        createVirtualElement("a", linkAttributes, text, []),
    ]);
}

// Renders the sidebar with framework information and links
function renderSidebar() {
    return [
        createVirtualElement("header", {}, "", [
            createVirtualElement("h3", {}, "Mini-Framework", []),
            createVirtualElement("span", { class: "source-links" }, "", [
                createVirtualElement("h5", {}, "Usage", []),
                createVirtualElement(
                    "a",
                    {
                        href: "https://github.com/JSundb/mini-framework/blob/main/FRAMEWORK_DOCS.md",
                    },
                    "Documentation",
                    []
                ),
            ]),
        ]),
        createVirtualElement("hr", {}, "", []),
        createVirtualElement("blockquote", { class: "quote speech-bubble" }, "", [
            createVirtualElement(
                "p",
                {},
                "A lightweight framework for building interactive web applications with virtual DOM creation, efficient DOM diffing, event management, client-side routing, and reactive state updates.",
                []
            ),
            createVirtualElement("footer", {}, "", [
                createVirtualElement(
                    "a",
                    { href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
                    "Learn JavaScript",
                    []
                ),
            ]),
        ]),
        createVirtualElement("hr", {}, "", []),
        createVirtualElement("h4", {}, "Development Team", []),
        createVirtualElement("ul", {}, "", [
            createVirtualElement("li", {}, "", [
                createVirtualElement("a", { href: "https://github.com/JSundb" }, "Johannes Sundbäck", []),
            ]),
            createVirtualElement("li", {}, "", [
                createVirtualElement("a", { href: "https://github.com/abrakhova" }, "Ekaterina Abrakhova", []),
            ]),
            createVirtualElement("li", {}, "", [
                createVirtualElement("a", { href: "https://github.com/srbudaev" }, "Sergei Budaev", []),
            ]),
        ]),
        createVirtualElement("footer", {}, "", [
            createVirtualElement("hr", {}, "", []),
            createVirtualElement(
                "em",
                {},
                "If you have other helpful links to share, or find any of the links above no longer work, please ",
                []
            ),
            createVirtualElement(
                "a",
                { href: "https://github.com/JSundb/mini-framework/issues" },
                "let us know",
                []
            ),
        ]),
    ];
}

// Renders the info footer section with instructions and credits
function renderInfo() {
    return createVirtualElement("footer", { class: "info" }, "", [
        createVirtualElement("p", {}, "Double-click to edit a todo", []),
        createVirtualElement("p", {}, "", [
            createVirtualElement("span", {}, "Created by ", []),
            createVirtualElement("a", { href: "#" }, "The Last of the Mohicans 2", []),
        ]),
        createVirtualElement("p", {}, "", [
            createVirtualElement("span", {}, "Part of ", []),
            createVirtualElement("a", { href: "http://todomvc.com" }, "TodoMVC", []),
        ]),
    ]);
}

export { renderHeader, renderMain, renderTodoItem, renderFooter, renderFilterLink, renderSidebar, renderInfo };