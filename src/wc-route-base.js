export default class WCRouteBase extends HTMLElement{
  constructor(){
    super()
    this.firstLoad = undefined;
    this.contentLoaded = false
    if(!this.file) this.contentLoaded = true
    this.fullyActive = false
    this._setInvisible()
  }

  get file(){
    return this.getAttribute('file')
  }

  async show(){
    this._setFirstLoadVar()
    this._dispatchPreLoadEvents()
    await this.getContent()
    this._setVisible()
    this._dispatchPostLoadEvents()
    this.fullyActive = true
  }

  async hideIfContainsNoCurrentRoute(){
    if(!this.querySelector("wc-route[current]")) this._setInvisible()
  }

  async hide(){
    this.fullyActive = false
    this._setInvisible()
  }

  _setFirstLoadVar(){
    if(this.firstLoad === undefined) this.firstLoad = true
    else if(this.firstLoad === true) this.firstLoad = false
    // if its false, let it remain false
  }

  _dispatchPreLoadEvents(){
    if(this.firstLoad){
      const waitForLoadContent = () => {
        const wait = res => {
            this.addEventListener("loadContentLoaded", () => {
              this.removeEventListener("loadContentLoaded", wait)
              res()
            })
        }

        return new Promise(wait)
      }

      const eventLoad = {
        detail: {
          routeBase: this,
          waitForContent: waitForLoadContent
        }
      }

      this.dispatchEvent(new CustomEvent("load", eventLoad))
    }


    const waitForChangeContent = () => {
      const wait = res => {
          this.addEventListener("changeContentLoaded", () => {
            this.removeEventListener("changeContentLoaded", wait)
            res()
          })
      }

      return new Promise(wait)
    }

    const eventChange = {detail: 
      {routeBase: this, waitForContent: waitForChangeContent}
    }
    this.dispatchEvent(new CustomEvent("change", eventChange))
  }

  _dispatchPostLoadEvents(){
    if(this.firstLoad){
      const event = {detail: {routeBase: this}}
      this.dispatchEvent(new CustomEvent("loadContentLoaded", event))
    }

    const event = {detail: {routeBase: this}}
    this.dispatchEvent(new CustomEvent("changeContentLoaded", event))
   }

  /**
   * fetches the content and returns it
   * caches the data after the first time it fetches it
   */
  async getContent(){
    if(this.file){ 
      if(!this.contentLoaded){
        const resp = await fetch(this.file)
        const text = await resp.text()
        const toAddLater = [...this.children]

        this.insertAdjacentHTML("afterbegin", text)
        const insert = this.getElementsByTagName("wc-route-insert")[0]

        if(!insert) {
          console.log(this)
          throw Error("inserted html via <wc-route-base> does NOT have a <wc-route-insert> tag")
        }

        insert.append(...toAddLater)
        this.contentLoaded = true

        return this.innerHTML
      } else {
        return this.innerHTML
      }
    }
    return this.innerHTML
  }

  _setVisible(){this.setAttribute("current", "")}
  _setInvisible(){
    this.removeAttribute("current")

    if(this.firstLoad !== undefined){
      this.dispatchEvent(new CustomEvent("hidden"))
    }
  }
} 

customElements.define("wc-route-base", WCRouteBase)
