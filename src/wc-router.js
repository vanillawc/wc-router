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

  /**gets the current route*/
  get currentRoute(){
    return this.querySelector("wc-route[current]")
  }

  /**
   * set the route via the path of the route
   *
   * @param {string} path - the path of the route that should be selected
   */
  async setRoute(path){
    if(path.startsWith("/")) path = path.substring(1)
    if(path === ""){
      await this.setMainPage()
      return
    }

    let pathParts = path.split("/")
    let pathNotFound = true
    let routes = [...this.routes];

    if(this.currentRoute) await this.currentRoute.teardownAsCurrent();

    for(let route of routes){
      if(route.path === "/" + pathParts[0]){
        route.setAttribute("current", "")
        await route.setupAsCurrent()
        pathNotFound = false

        if(pathParts.length > 1){
          const nextRouter = route.getElementsByTagName("wc-router")
          await nextRouter.setRoute(pathParts.split(1).join("/"))
        }
      }
      else route.removeAttribute("current")
    }

    if(pathNotFound){this.setCatchAll()}
    if(pathParts.length === 1) this.setRouteHistory(pathParts[0])
  }

  /** sets the route history to the current route, if the history api is available*/
  setRouteHistory(path){
    const totalPath = wcrouter.basePath.concat(this.basePath)
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
