/**
 * @fileoverview Core Application Framework - DOM Abstraction, State Management & Routing
 * @description This module provides the main application orchestrator that implements:
 *              - DOM Abstraction through Virtual DOM
 *              - State Management with reactive updates
 *              - Routing System with URL synchronization
 *              - Event Handling with custom event delegation
 * @version 0.0.1
 * @author The Last of the Mohicans 2
 */

// Framework core dependencies
import { ReactiveStateContainer, globalStateManager } from "./State.js";
import { updateDom } from "./VDom.js";
import { RouteManager, globalRouteManager } from "./Route.js";

/** @constant {string} Framework version identifier */
const FRAMEWORK_VERSION = "0.0.1";

/**
 * Main Application Framework Class
 * Coordinates DOM abstraction, state management, routing, and event handling
 * @class FrameworkApplication
 */
class FrameworkApplication {
  /**
   * Initialize new framework application instance
   * @param {string} [rootSelector='#app'] - CSS selector for root mounting element
   */
  constructor(rootSelector = "#app") {
    /** @type {Element|null} Root DOM element for application mounting */
    this.rootElement = null;
    
    /** @type {string} CSS selector for root element */
    this.rootSelector = rootSelector;
    
    /** @type {Function|null} Main rendering function for virtual DOM generation */
    this.renderFunction = null;
    
    /** @type {boolean} Application initialization status */
    this.isInitialized = false;
    
    /** @type {Map<string, Function>} Custom event handlers registry */
    this.eventHandlers = new Map();
    
    /** @type {Object} Application configuration options */
    this.config = {
      enableVirtualDOM: true,
      enableStateManagement: true,
      enableRouting: true,
      enableCustomEvents: true
    };
  }

  // ===== DOM ABSTRACTION METHODS =====

  /**
   * Sets the main render function for Virtual DOM generation
   * @param {Function} renderFn - Function that returns virtual DOM structure
   * @returns {FrameworkApplication} Returns this instance for method chaining
   * @throws {Error} Throws if renderFn is not a function
   */
  setRenderFunction(renderFn) {
    if (typeof renderFn !== "function") {
      throw new Error("Render function must be a function");
    }
    this.renderFunction = renderFn;
    // Set up automatic re-rendering on state changes
    globalStateManager.configurePrimaryUpdateHandler(() => this.render());
    return this;
  }

  /**
   * Renders the application using Virtual DOM
   * @throws {Error} Throws if no render function is set or app is not initialized
   */
  render() {
    if (!this.renderFunction) {
      throw new Error("No render function set. Use setRenderFunction() first.");
    }
    if (!this.rootElement) {
      throw new Error("App not initialized. Call initialize() first.");
    }

    const virtualDOM = this.renderFunction();
    updateDom(this.rootElement, Array.isArray(virtualDOM) ? virtualDOM : [virtualDOM]);
  }

  // ===== ROUTING SYSTEM METHODS =====

  /**
   * Registers a route with the routing system
   * @param {string} path - Route path pattern
   * @param {Function} handler - Route handler function
   * @returns {FrameworkApplication} Returns this instance for method chaining
   */
  addRoute(path, handler) {
    globalRouteManager.registerRoute(path, handler);
    return this;
  }

  /**
   * Navigates to a specific route programmatically
   * @param {string} path - Route path to navigate to
   */
  navigateTo(path) {
    globalRouteManager.navigateToRoute(path);
  }

  // ===== STATE MANAGEMENT METHODS =====

  /**
   * Gets the current application state
   * @returns {Object} Current state object
   */
  getState() {
    return globalStateManager.getCurrentState();
  }

  /**
   * Updates the application state
   * @param {Object} newState - New state object or partial state to merge
   * @param {boolean} [triggerRender=true] - Whether to trigger a re-render
   * @returns {Object} Updated state object
   */
  setState(newState, triggerRender = true) {
    return globalStateManager.updateState(newState, triggerRender);
  }

  /**
   * Subscribes to state changes
   * @param {Function} callback - Function to call when state changes
   * @returns {Function} Unsubscribe function
   */
  onStateChange(callback) {
    return globalStateManager.addObserver(callback);
  }

  // ===== EVENT HANDLING METHODS =====

  /**
   * Registers a custom event handler (alternative to addEventListener)
   * @param {string} eventName - Name of the event
   * @param {string} selector - CSS selector for target elements
   * @param {Function} handler - Event handler function
   * @returns {FrameworkApplication} Returns this instance for method chaining
   */
  on(eventName, selector, handler) {
    const eventKey = `${eventName}:${selector}`;
    this.eventHandlers.set(eventKey, handler);
    
    // Use event delegation on the root element
    if (this.rootElement) {
      this.rootElement.addEventListener(eventName, (event) => {
        if (event.target.matches(selector)) {
          handler(event);
        }
      });
    }
    
    return this;
  }

  /**
   * Removes a custom event handler
   * @param {string} eventName - Name of the event
   * @param {string} selector - CSS selector for target elements
   * @returns {boolean} True if handler was removed
   */
  off(eventName, selector) {
    const eventKey = `${eventName}:${selector}`;
    return this.eventHandlers.delete(eventKey);
  }

  /**
   * Triggers a custom event
   * @param {string} eventName - Name of the event to trigger
   * @param {Object} [data={}] - Data to pass with the event
   * @param {string} [selector] - Optional selector to target specific elements
   */
  trigger(eventName, data = {}, selector = null) {
    const event = new CustomEvent(eventName, { detail: data });
    
    if (selector) {
      const elements = this.rootElement.querySelectorAll(selector);
      elements.forEach(el => el.dispatchEvent(event));
    } else {
      this.rootElement.dispatchEvent(event);
    }
  }

  // ===== APPLICATION LIFECYCLE METHODS =====

  /**
   * Initializes the application with all framework features
   * @returns {FrameworkApplication} Returns this instance for method chaining
   * @throws {Error} Throws if root element is not found
   */
  initialize() {
    if (this.isInitialized) {
      console.warn("Application already initialized");
      return this;
    }

    // Find and validate root element
    this.rootElement = document.querySelector(this.rootSelector);
    if (!this.rootElement) {
      throw new Error(`Root element with selector "${this.rootSelector}" not found`);
    }

    // Initialize routing system if enabled
    if (this.config.enableRouting) {
      this._initializeRouting();
    }

    // Set up event delegation if enabled
    if (this.config.enableCustomEvents) {
      this._initializeEventHandling();
    }

    this.isInitialized = true;
    console.log(`Framework Application initialized (v${FRAMEWORK_VERSION})`);

    // Initial render
    if (this.renderFunction) {
      this.render();
    }

    return this;
  }

  /**
   * Configures application options
   * @param {Object} options - Configuration options
   * @returns {FrameworkApplication} Returns this instance for method chaining
   */
  configure(options) {
    this.config = { ...this.config, ...options };
    return this;
  }

  // ===== PRIVATE INITIALIZATION METHODS =====

  /**
   * Initializes the routing system
   * @private
   */
  _initializeRouting() {
    // Set up hash change listener for routing
    window.addEventListener("hashchange", () => {
      globalRouteManager.handleRouteChange(window.location.hash);
    });

    // Execute initial route
    globalRouteManager.handleRouteChange(window.location.hash || "#/");
  }

  /**
   * Initializes custom event handling system
   * @private
   */
  _initializeEventHandling() {
    // Set up delegation for all registered event handlers
    this.eventHandlers.forEach((handler, eventKey) => {
      const [eventName, selector] = eventKey.split(':');
      this.rootElement.addEventListener(eventName, (event) => {
        if (event.target.matches(selector)) {
          handler(event);
        }
      });
    });
  }
}

/**
 * Factory function for creating Framework Application instances
 * @param {string} [rootSelector='#app'] - CSS selector for the root element
 * @returns {FrameworkApplication} New Framework Application instance
 * @example
 * const app = createApp('#my-app');
 * app.setRenderFunction(() => ({ tag: 'div', text: 'Hello World' }));
 * app.initialize();
 */
export function createApp(rootSelector = "#app") {
  return new FrameworkApplication(rootSelector);
}

// Export the main class and backward compatibility
export { FrameworkApplication, FrameworkApplication as ApplicationManager };
