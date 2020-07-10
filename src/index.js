import chahiye from "https://cdn.jsdelivr.net/gh/therealadityashankar/chahiye@0.5.0/chahiye.js"
import RA from "./r-a.js"
import WCRouter from "./wc-router.js"
import WCRoute from "./wc-route.js"

window.wcrouter = {
  WCRoute,
  WCRouter,
  RA,
  /** the topmost router*/
  mainrouter : undefined,
  basePath: [],
  get currentPath(){
    return location.pathname.split("/").slice(1)
  },
}


window.addEventListener('DOMContentLoaded', () => {
  // there can only be one wc-router in the top level
  const WCRouter = document.getElementsByTagName("wc-router")[0] 
  const WCRouterOptions = document.getElementsByTagName("wc-router-options")[0]

  wcrouter.mainrouter = WCRouter;
  WCRouter.setMainPage()

  if(WCRouterOptions){
    wcrouter.basePath = WCRouterOptions.getAttribute("base-path").split("/")
    for(let path of wcrouter.basePath){
      if(path === wcrouter.currentPath[0]) wcroute.currentPath.pop(0)
      else{
        console.error(`wcrouter: basePath path is not in location.PathName, 
basePath element: "${path}", location.pathname Element : "${wcrouter.currentPath[0]}"
wcrouter.currentPath : "${wcroute.currentPath}",
wcrouter.basePath : "${wcroute.basePath}"
`)
        console.trace()
      }
    }
  }

  if(WCRouter) setRequiredRoutes(WCRouter, 0);
});


window.addEventListener("popstate", () => {
  console.log("now:", wcrouter.currentPath.join("/"));
  wcrouter.mainrouter.setRoute(wcrouter.currentPath.join("/"))
})


/**
 * open and set the required routes
 * in WCRouters, based in the current path
 *
 * @param {object} toOpen - the wc-router to open
 * @param {array} pathNum - the path index of window.wcrouter.currentPath the recursivity is on
 */
function setRequiredRoutes(toOpen, pathNum){
  const currentPath = wcrouter.currentPath[pathNum]
  
  if(currentPath){
    toOpen.setRoute(currentPath)
    toOpen.basePath = wcrouter.currentPath.slice(0, pathNum)
  } 

  if(pathNum + 1 < wcrouter.currentPath.length){
    const nextWCRouter = toOpen.getElementsByTagName("wc-router")[0]
    if(!nextWCRouter) toOpen.setCatchAll()

    nextWCRouter.parentRouter = toOpen;
    nextWCRouter.setMainPage()
    setRequiredRoutes(nextWCRouter, pathNum + 1)
  } 
}

async function getStyleSheet(){ 
  // get the css file, don't show anything before that !
  document.getElementsByTagName("wc-router").style = "display: none"
  const stylesheet = await chahiye.load("linkCSS", "./index.css", import.meta.url)
  document.getElementsByTagName("wc-router").style = ""
}

getStyleSheet()
