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
    if(this.eager) this.getContent();
    this._previousCurrentFile = undefined;
  }

  /**
   * setup as the current page
   */
  async setupAsCurrent(){
    const routeEvents = await this.getRouteEvents()
    await this.getContent()

    if(routeEvents){
      if(routeEvents.load) routeEvents.load(this)
    }

    if(this.file){
      this._previousCurrentFile = wcrouter.currentFile
      const url = (new URL(this.file, location.href)).href
      wcrouter.currentFile = url
    }
  }

  /**
   * teardown as the current page
   */
  async teardownAsCurrent(){
    const routeEvents = await this.getRouteEvents()

    if(routeEvents){
      if(routeEvents.teardown) routeEvents.teardown(this)
    }

    if(this.file){
      wcrouter.currentFile = this._previousCurrentFile
      this._previousCurrentFile = undefined
    }
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
  get path(){return this.getAttribute("path")}

  /**
   * read-only, is the wc-route eager loaded ?
   */
  get eager(){
    return this.router.eager||this.hasAttribute("eager")
  }

  /**
   * read-only, the parent router of the wc-route element
   */
  get router(){
    return this.parentNode
  }

  /**
   * read-only, is this the current page ?
   */
  get current(){
    return this.hasAttribute("current")
  }

  /**
   *
   */
  get liveReload(){
    return this.router.hasAttribute("live-reload")||this.hasAttribute("live-reload")
  }

  /**
   * returns object containing the events that are to happen
   */
  async getRouteEvents(){
    if(this.hasAttribute("events-loc")){
      const href = (new URL(this.getAttribute("events-loc"), wcrouter.currentFile)).href
      return await import(href)
    }
  }

  /**
   * async function, gets the content of the wc-route element
   */
  async getContent(){
    // if live reload is not true,
    // and content has been loaded previously 
    if(!this.liveReload){
      if(this.innerHTML.trim() != "") return this.innerHTML
    }

    if(!this.file) return this.innerHTML

    const url = (new URL(this.file, location.href)).href
    const resp = await fetch(url);
    const text = await resp.text()

    this.innerHTML = text;
    return this.innerHTML;
  }
}

customElements.define("wc-route", WCRoute)
