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


    if(this.eager) this.getContent();
    this._previousCurrentFile = undefined;
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
    return wcrouter.basePath + "/" + this.path.substring(1)
  }

  get url(){
    return (new URL(location.href, this.fullpath)).href
  }

  /**
   * setup as the current page
   */
  async setupAsCurrent(){
    await this.getContent()

    if(this.file){
      this._previousCurrentFile = wcrouter.currentFile
      const url = (new URL(this.file, location.href)).href
      wcrouter.currentFile = url
    }

    if(this.firstLoad === undefined) this.firstLoad = true
    else if(this.firstLoad) this.firstLoad = false
  }

  /**
   * teardown as the current page
   */
  async teardownAsCurrent(){
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
  get path(){
    const path = this.getAttribute("path")

    if(!path.startsWith("/")) return "/" + path
    return path
  }

  /**
   * read-only, is the wc-route eager loaded ?
   */
  get eager(){
    return this.router.hasAttribute("eager")||this.hasAttribute("eager")
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
   * async function, gets the content of the wc-route element
   */
  async getContent(){
    // if live reload is not true,
    // and content has been loaded previously 
    if(!this.liveReload){
      if(this.contentLoaded) return this.innerHTML
    }

    if(!this.file) return this.innerHTML

    this.innerHTML = "loading content..."
    const url = (new URL(this.file, location.href)).href
    const resp = await fetch(url);
    const text = await resp.text()

    this.innerHTML = text;
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
    path = (new URL(path, wcrouter.baseURL)).pathname
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
}

customElements.define("wc-route", WCRoute)
