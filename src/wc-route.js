import WCRouteBase from "./wc-route-base.js"
import WCRouter from "./wc-router.js"

/**
 * the wc-route element
 *
 * attributes:
 * - file : string - location of the file
 * - path : string - the path the route element represents
 * - eager : boolean parameter - load the file early ?
 * - live-reload : boolean parameter - live reload the file, instead of caching it ?
 * - events-loc : script location, has to be a module, that'll be called when the page is loaded
 *   exported from module [everything is optional]
 *   - load: the function called when the route is loaded
 *   - teardown: the function called when the route is torn down
 */
export default class WCRoute extends HTMLElement{
  constructor(){
    super() 
    // is this the first time the page has been loaded
    this.firstLoad = undefined;
    this.contentLoaded = false
    if(!this.hasAttribute("file")) this.contentLoaded = true
  }

  static get observedAttributes() {
    return ['current']
  }

  attributeChangedCallback(name, oldValue, newValue){
    if(name === "current"){
      if(typeof newValue === "string") this.setupAsCurrent()
      else this.teardownAsCurrent()
    }
  }

  get fullPath(){
    return "/" + this.path.substring(1)
  }

  get url(){
    return (new URL(location.href, this.fullpath)).href
  }

  async setupAsCurrent(){
    this.setFirstLoadVar()
    this._dispatchPreContentLoadedEvents()
    this._setStyleDisplayHidden()
    await this.getContent()
    this._removeStyleDisplayHidden()
    this._dispatchPostContentLoadedEvents()
  }

  async teardownAsCurrent(){
    this.dispatchEvent(new CustomEvent("hidden", {detail: {wcroute:this}}))
  }

  _dispatchPreContentLoadedEvents(){
    if(this.firstLoad) 
      this.dispatchEvent(new CustomEvent("load", {detail:{wcroute:this}}));

    this.dispatchEvent(new CustomEvent("shown", {detail:{wcroute:this}}))
  }

  _dispatchPostContentLoadedEvents(){
    if(this.firstLoad) 
      this.dispatchEvent(new CustomEvent("loadContentLoaded", {detail:{wcroute:this}}));

    this.dispatchEvent(new CustomEvent("shownContentLoaded", {detail:{wcroute:this}}))
  }

  setFirstLoadVar(){
    if(this.firstLoad === undefined) this.firstLoad = true;
    else if(this.firstLoad) this.firstLoad = false
  }

  /**
   * gets the file url of the wc-route element
   */
  get file(){
    return this.getAttribute("file")
  }

  /**
   * gets the path of the wc-route element
   */
  get path(){
    const path = this.getAttribute("path")

    if(!path.startsWith("/")) return "/" + path
    return path
  }

  /**
   * read-only, is the wc-route eager loaded ?
   */
  get eager(){
    return wcrouter.mainrouter.hasAttribute("eager")||this.hasAttribute("eager")
  }

  /**
   * get all the routes the current wc-route is inside,
   *
   * this goes in the order, nearest base -> furthest base
   */
  get bases(){
    const bases = []
    let el = this

    while (el.parentNode instanceof WCRouteBase){
      bases.push(el.parentNode)
      el = el.parentNode
    }

    return bases
  }

  /**
   * read-only, is this the current page ?
   */
  get current(){ return this.hasAttribute("current") }

  /**
   * should the content be fetched every time the page loads
   */
  get liveReload(){
    return wcrouter.mainrouter.hasAttribute("live-reload")||this.hasAttribute("live-reload")
  }

  /**
   * async function, gets the content of the wc-route element
   */
  async getContent(){
    // if live reload is not true,
    // and content has been loaded previously 
    if(!this.liveReload){
      if(this.contentLoaded) return this.innerHTML
    }

    const thisHasNoBases = this.bases.length === 0

    if((!this.file) && thisHasNoBases) return this.innerHTML

    this.innerHTML = "loading content..."

    let fullInnerHTML = ""

    const url = (new URL(this.file, location.href)).href
    const resp = await fetch(url);
    const respText = await resp.text()

    if(thisHasNoBases){
      fullInnerHTML += respText
    } else {
      const bases = this.bases
      let currHTML = respText

      for(const base of bases){
        currHTML = await base.insert(currHTML)
      }

      fullInnerHTML += currHTML
    }

    this.innerHTML = fullInnerHTML;
    this.contentLoaded = true
    return this.innerHTML;
  }

  /**
   * check if path matches for the mentioned path
   *
   * @param {string} path - the path to match for
   *
   * @returns {object} - {matches : bool, params : obj}, params contains the params that are present in the path
   */
  matches(path){
    path = (new URL(path, location.origin)).pathname
    const fullPath = this.fullPath
    const params = {}
    const thisFullPathSplit = fullPath.split("/")
    const pathSplit = path.split("/")

    // the length of the pathsplit can never be lesser
    if(pathSplit.length < thisFullPathSplit.length) return {matches:false}

    for(let i=0; i<pathSplit.length; i++){
      const thisPathVal = thisFullPathSplit[i]
      const pathVal = pathSplit[i]

      if(thisPathVal === undefined) return {matches:false}

      if(thisPathVal.startsWith(":")){
        const param = thisPathVal.substring(1)
        params[param] = pathVal
        continue;
      }

      if(thisPathVal.startsWith("path:")){
        if(i !== thisFullPathSplit.length - 1) {
          throw Error("wc-route: 'path:' can only be present at the end of a path, i.e. as a catch-all")
        }
        const param = thisPathVal.substring("path:".length)
        params[param] = pathSplit.slice(i)

        return {
          matches : true,
          params: params
        }
      }

      if(thisPathVal !== pathVal) return {matches : false}
    }

    return {matches:true, params}
  }

  _setStyleDisplayHidden(){
    this.style.display = "none"
  }

  _removeStyleDisplayHidden(){
    this.style.display = ""
  }
}

customElements.define("wc-route", WCRoute)
