/**
 * @fileoverview Routing system for the mini-framework
 * @version 0.0.1
 * @author The Last of the Mohicans 2
 */

/** @type {Map<string, Function>} Global route storage mapping URLs to handler functions */
export let allRoutes = new Map()
export let defaultRoute

/**
 * Adds a new route to the router
 * @param {string} url - URL pattern for the route (e.g., "/", "/about", "/user/:id")
 * @param {Function} handler - Function to execute when route is matched
 * @returns {boolean} True if route was added successfully, false if invalid parameters or route already exists
 * @example
 * addRoute("/home", () => console.log("Home page"));
 * addRoute("/user/:id", (params) => console.log("User:", params.id));
 */
export function addRoute(url, handler) {
  if (typeof url !== "string" || typeof handler !== "function") return false;
  if (allRoutes.has(url)) return false;
  allRoutes.set(url, handler);
  return true;
}

export function addDefaultRoute(handler) {
  if (typeof handler !== "function") return false;
  defaultRoute = handler;
  return true;
}

/**
 * Executes the handler for a specific route
 * @param {string} url - URL to route to (with or without # prefix)
 * @description If the URL is not found in routes, defaults to "/" route.
 * Updates browser history if the current hash doesn't match the target URL.
 * @example
 * executeRoute("#/home"); // Executes handler for /home route
 * executeRoute("/about");  // Executes handler for /about route
 */
export function executeRoute(url) {
  // Clean up the URL - remove # prefix if present
  let cleanUrl = url.startsWith("#") ? url.substring(1) : url;

  // If url is not bound to a handler, we route to the default one
  if (!allRoutes.has(cleanUrl)) {
    cleanUrl = "/";
  }

  // Execute the handler
  if (allRoutes.has(cleanUrl)) {
    allRoutes.get(cleanUrl)();
  } else {
    console.log("No handler found for route:", cleanUrl);
  }

  // Update browser history if needed
  const hashUrl = cleanUrl.startsWith("#") ? cleanUrl : "#" + cleanUrl;
  if (window.location.hash !== hashUrl) {
    history.pushState(null, "", hashUrl);
  }
}
