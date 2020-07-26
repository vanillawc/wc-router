import WCRoute from "./wc-route.js"

/**
 * the wc-router element
 *
 * attributes:
 *   - routes: all the wc-route elements in the project
 *   - eager: if the element is not lazy loaded
 */
export default class WCRouter extends HTMLElement{}

customElements.define("wc-router", WCRouter)
