import chahiye from "https://cdn.jsdelivr.net/gh/therealadityashankar/chahiye@0.5.0/chahiye.js"
import RA from "./r-a.js"
import WCRouter from "./wc-router.js"
import WCRoute from "./wc-route.js"

class RouterTools extends EventTarget{
  constructor(){
    super()
    // here for easy access by users
    this.WCRoute = WCRoute
    this.WCRouter = WCRouter
    this.RA = RA
  }

  /** the topmost router*/
  get mainrouter(){
    return document.getElementsByTagName("wc-router")[0]
  }

  get basePath(){
    return ""
  }

  get baseURL(){
    return location.origin + this.basePath
  }

  /**
   * get the currentPath ignorant of hashStrategy or normal strategy
   *
   * @returns {string}
   */
  get currentPath(){
    if(this.hashStrategy){
      return location.hash.substring(1);
    }
    else return location.pathname;
  }

  /**
   * @returns {bool}
   */
  get hashStrategy(){
    return this.mainrouter.hasAttribute("hashStrategy")
  }

  /**
   * set the correct wcroute to current
   *
   * @param {string} path - the path to set
   */
  route(path) {
    const lastRoute = this.currentRoute;
    if(path.endsWith("/")) path = path.substring(0, path.length - 1)
    if(path === "") path = "/"

    this.setMatchingWCRoute(path)
    this.routeHistory(path)
  }

  setMatchingWCRoute(path){
    const routeStuff = this.getMatchingRoute(path)
    if(routeStuff){
      // firstLoad would be undefined as it has not loaded yet !
      const firstLoad = (routeStuff.wcroute.firstLoad === undefined);

      if(this.currentRoute) this.currentRoute.removeAttribute("current")
      routeStuff.wcroute.setAttribute("current", "")

      this._dispatchRouteChangeEvents(routeStuff.wcroute, firstLoad)
      this._setDispatchPostLoadRouteChangeEvents(routeStuff.wcroute, firstLoad)
      wcrouter.params = routeStuff.matchDetails.params
    } else{
      throw Error(`wcroute - no route matching path '${path}'`)
    }
  }

  getMatchingRoute(path){
    for (const wcroute of document.getElementsByTagName("wc-route")) {
      const matches = wcroute.matches(path)
      if(matches.matches) {
        return {wcroute, matchDetails: matches}
      }
    }
  }

  _dispatchRouteChangeEvents(route, firstLoad){
    this.dispatchEvent(new CustomEvent("routeChange", {detail: {currentRoute:route}}))
    
    if(firstLoad){
      this.dispatchEvent(new CustomEvent("routeLoad", {detail: {currentRoute:route}}))
    }
  }

  _setDispatchPostLoadRouteChangeEvents(currentRoute, firstLoad){
    if(firstLoad){
      currentRoute.addEventListener("loadContentLoaded", () => {
        this.dispatchEvent(new CustomEvent("routeLoadContentLoaded", {detail: {currentRoute}}))
      })
    }

    currentRoute.addEventListener("shownContentLoaded", () => {
      this.dispatchEvent(new CustomEvent("routeChangeContentLoaded", {detail: {currentRoute}}))
    })
  }

  /**
   * change the current page location
   * changes the location based on if hashLocationStrategy or normal mode
   *
   * @param path {string} - the path to change the history to
   */
  routeHistory(path){ 
    if(this.hashStrategy) location.hash = path
    else{
      if(window.history) {
        if(location.pathname === path||location.pathname === path + "/") return
        else history.pushState({}, "", path)
      }
    }
  }

  get currentRoute(){
    return document.querySelector("wc-route[current]")
  }
}

window.wcrouter = new RouterTools()

window.addEventListener('DOMContentLoaded', () => {
  wcrouter.route(wcrouter.currentPath);
  const wcroutes = [...document.getElementsByTagName("wc-route")]
  loadEagerRoutes()
});


function setAutoURLRoute(){
  if(wcrouter.hashStrategy){
    // this is needed as
    // r-a/wcrouter.route() change the hash too
    // so if hashchange is called everytime
    // and not just when the hash automatically changes (for example when the back btn is pressed)
    // the wcrouter.route() will run twice
    let lastPath = wcrouter.currentPath;

    window.addEventListener("hashchange", () => {
      hideAllWCRouteBases()
      if (lastPath === wcrouter.currentPath) return;

      wcrouter.route(wcrouter.currentPath)
      lastPath = wcrouter.currentPath;
    })
  }
  else {
    window.addEventListener("popstate", () => {
      hideAllWCRouteBases()
      wcrouter.route(location.pathname)
    })
  }
}

function loadEagerRoutes(){
  const wcroutes = [...document.getElementsByTagName("wc-route")]
  wcroutes.forEach(r => {
    if(r.eager) {
      r.getContent()
      r._getCSSLinkIfNeeded()
    }
  })
}

function hideAllWCRouteBases(){
  const routeBases = document.getElementsByTagName("wc-route-base")
  for(const base of routeBases) base.hide()
}


async function getStyleSheet(){ 
  // get the css file, don't show anything before that !
  document.getElementsByTagName("wc-router").style = "display: none"
  const stylesheet = await chahiye.load("linkCSS", "./index.css", import.meta.url)
  document.getElementsByTagName("wc-router").style = ""
}

function main(){
  getStyleSheet()
  setAutoURLRoute()
}

main()

