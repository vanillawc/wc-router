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
    const WCRouterOptions = document
                              .getElementsByTagName("wc-router-options")[0]

    if(WCRouterOptions){
      const path = WCRouterOptions.getAttribute("base-path")
      if(path.startsWith("/")) return path
      else return "/" + path
    }

    return ""
  }

  get baseURL(){
    return location.origin + this.basePath
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

    const currentRoute = this.currentRoute;
    this.dispatchEvent(new CustomEvent("routeChange", {detail: {lastRoute, currentRoute}}))

    if(this.currentRoute.firstLoad)
      this.dispatchEvent(new CustomEvent("routeLoad", {detail: {lastRoute, currentRoute}}))

  }

  setMatchingWCRoute(path){
    const routeStuff = this.getMatchingRoute(path)
    if(routeStuff){
      if(this.currentRoute) this.currentRoute.removeAttribute("current")
      routeStuff.wcroute.setAttribute("current", "")
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

  routeHistory(path){ 
    if(window.history) {
      if(location.pathname === path||location.pathname === path + "/")
        return
      else history.pushState({}, "", path)
    }
  }

  get currentRoute(){
    return document.querySelector("wc-route[current]")
  }
}

window.wcrouter = new RouterTools()

window.addEventListener('DOMContentLoaded', () => {
  wcrouter.route(location.pathname)
  const wcroutes = [...document.getElementsByTagName("wc-route")]
});


window.addEventListener("popstate", () => {
  wcrouter.route(location.pathname)
})


async function getStyleSheet(){ 
  // get the css file, don't show anything before that !
  document.getElementsByTagName("wc-router").style = "display: none"
  const stylesheet = await chahiye.load("linkCSS", "./index.css", import.meta.url)
  document.getElementsByTagName("wc-router").style = ""
}

getStyleSheet()
