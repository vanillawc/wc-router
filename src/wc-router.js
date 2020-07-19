import WCRoute from "./wc-route.js"

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
    this.basePath = [];

    let el = this
    while(true){
      if(el.parentNode instanceof WCRoute){
        this.basePath.splice(0, 0, el.parentNode.path)
      }
      if(el.parentNode === document.body) break;
      el = el.parentNode
    }

    if(this.hasAttribute("main")) this.basePath.pop()
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

        const nextRouter = route.getElementsByTagName("wc-router")[0]

        if(pathParts.length > 1){
          if(!nextRouter) throw Error(`wc-router: no wc-router inside ${route}, unable to route to ${path}`)
          if(nextRouter.hasRouteOrCatchAll(pathParts.slice(1).join("/"))){
            await nextRouter.setRoute(pathParts.slice(1).join("/"))
          } else{
            pathNotFound = true
          }
        } else{
          if(nextRouter) {nextRouter.setMainPage()}
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
    console.log(totalPathString, location.pathname)
    // don't do anything if we're already at this location
    if("/" + totalPathString === location.pathname) return;
    if(totalPathString === location.pathname + "/") return;
    if(window.history){
      if(totalPathString === "") history.pushState({}, "", "/")
      else history.pushState({}, "", totalPathString)
    }
  }

  /**
   * sets the catch all page as the current page
   */
  setCatchAll(){
    for (let route of this.routes) route.removeAttribute("current")
    let catchAllPage = this.querySelector("wc-route[catch-all]")
    if(catchAllPage){
      catchAllPage.setAttribute("current", "")
      catchAllPage.setupAsCurrent()
    }
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
    this.setRouteHistory("")
  }

  /**
   * returns true if the router has a catch all, or the specified route path
   */
  hasRouteOrCatchAll(path){
    if(path.startsWith("/")) path = path.substring(1)
    if(this.querySelector("wc-route[catch-all]")) return true
    for (const route of this.routes) {
      if(route.path === path) return true
    }
    return false
  }
}

customElements.define("wc-router", WCRouter)
