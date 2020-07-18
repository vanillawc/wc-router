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
    const fullPath = location.pathname.split("/").slice(1)

    for(let path of wcrouter.basePath){
      if(path === fullPath[0]) fullPath.pop(0)

      else{
        console.error(`wcrouter: basePath path is not in location.PathName,
(check if the base-path attribute in wc-router-options is correct !)`)
      }
    }

    return fullPath
  },
  currentFile: location.origin
}


window.addEventListener('DOMContentLoaded', () => {
  // there can only be one wc-router in the top level
  const WCRouter = document.getElementsByTagName("wc-router")[0] 
  const WCRouterOptions = document.getElementsByTagName("wc-router-options")[0]

  if(WCRouterOptions) wcrouter.basePath = WCRouterOptions.getAttribute("base-path").split("/")
  if(WCRouter) {
    WCRouter.setRoute(wcrouter.currentPath.join("/"))
    wcrouter.mainrouter = WCRouter;
  }
});


window.addEventListener("popstate", () => {
  wcrouter.mainrouter.setRoute(wcrouter.currentPath.join("/"))
})


async function getStyleSheet(){ 
  // get the css file, don't show anything before that !
  document.getElementsByTagName("wc-router").style = "display: none"
  const stylesheet = await chahiye.load("linkCSS", "./index.css", import.meta.url)
  document.getElementsByTagName("wc-router").style = ""
}

getStyleSheet()
