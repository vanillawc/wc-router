export default class WCRouteBase extends HTMLElement{
  constructor(){
    super()
    this.contentLoaded = false
    this.setInvisible()
  }

  get file(){
    return this.getAttribute('file')
  }

  async show(){
    await this.getContent()
    this.setVisible()
  }

  async hideIfContainsNoCurrentRoute(){
    if(!this.querySelector("wc-route[current]")) this.setInvisible()
  }

  async hide(){
    this.setInvisible()
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

  setVisible(){this.setAttribute("current", "")}
  setInvisible(){this.removeAttribute("current")}
} 

customElements.define("wc-route-base", WCRouteBase)
