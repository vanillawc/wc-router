export default class WCRouteBase extends HTMLElement{
  constructor(){
    super()
    this._content = ""
    this.contentLoaded = false
  }

  get file(){
    return this.getAttribute('file')
  }

  /**
   * fetches the content and returns it
   * caches the data after the first time it fetches it
   */
  async getContent(){
    if(!this.file){
      // basically we remove wc-routes and wc-route-bases in innerHTML
      // if the data is supplied via innerHTML
      const div = document.createElement('div')
      div.innerHTML = this.innerHTML

      const routes = [...div.getElementsByTagName("wc-route")];
      const bases = [...div.getElementsByTagName("wc-route-base")];

      routes.forEach(e => e.remove());
      bases.forEach(e => e.remove());

      return div.innerHTML
    } else {
      if(!this.contentLoaded){
        const resp = await fetch(this.file)
        const text = await resp.text()
        this._content = text
        this.contentLoaded = true
        return text
      } else {
        return this._content
      }
    }
  }

  /**
   * inserts data into the <wc-route-insert> present inside
   * this
   *
   * @param {string} html - the html you wanna put in
   */
  async insert(html){
    const div = document.createElement('div')
    div.innerHTML = await this.getContent()

    const insert = div.getElementsByTagName('wc-route-insert')[0]

    if(!insert) return div.innerHTML

    // fake render the passed html into a div
    const renderedHTMLdiv = document.createElement("div")
    renderedHTMLdiv.innerHTML = html

    if(renderedHTMLdiv.children.length > 0){
      insert.replaceWith(...renderedHTMLdiv.children)
      return div.innerHTML
    }
    else{
      insert.remove()
      return div.innerHTML
    }

  }
} 

customElements.define("wc-route-base", WCRouteBase)
