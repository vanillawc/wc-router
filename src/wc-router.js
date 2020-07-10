/**
 * the wc-router element
 *
 * attributes:
 *   - routes: all the wc-route elements in the project
 *   - eager: if the element is not lazy loaded
 */
export default class WCRouter extends HTMLElement{
  constructor(){
    super()

    // set at runtime
    this.parentRouter = undefined;
    this.basePath = [];
  }

  /**
   * all the routes in wc-router
   */
  get routes(){
    return this.getElementsByTagName("wc-route")
  }

  /**
   * is the element eager-loaded (the opposite of lazy loaded)
   */
  get eager(){
    return this.hasAttribute("eager")
  }

  /**
   * set the route via the path of the route
   *
   * @param {string} path - the path of the route that should be selected
   */
  async setRoute(path){
    let pathNotFound = true
    let routes = [...this.routes];

    for(let route of routes){
      if(route.path === path){
        route.setAttribute("current", "")
        await route.getContent()
        pathNotFound = false
      }
      else route.removeAttribute("current")
    }

    if(pathNotFound){this.setCatchAll()}

    this.setRouteHistory(path)
  }

  /** sets the route history to the current route, if the history api is available*/
  setRouteHistory(path){
    const totalPath = wcroute.basePath.concat(this.basePath)
    totalPath.push(path)

    const totalPathString = totalPath.join("/")
    
    // don't do anything if we're already at this location
    if("/" + totalPathString === location.pathname) return;
    if(window.history) history.pushState({}, "", totalPathString)
  }

  /**
   * sets the catch all page as the current page
   */
  setCatchAll(){
    for (let route of this.routes) route.removeAttribute("current")
    let catchAllPage = this.querySelector("wc-route[catch-all]")
    if(catchAllPage) catchAllPage.setAttribute("current", "")
  }

  /**
   * sets the main page
   */
  async setMainPage(){
    for (let route of this.routes) route.removeAttribute("current")
    let main = this.querySelector("wc-route[main]")
    if(main){
      main.setAttribute("current", "")
      await main.getContent()
    }
  }
}

customElements.define("wc-router", WCRouter)
