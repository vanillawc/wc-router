/**
 * the wc-route element
 *
 * attributes:
 * - file : string - location of the file
 * - path : string - the path the route element represents
 * - eager : boolean parameter - load the file early ?
 */
export default class WCRoute extends HTMLElement{
  constructor(){
    super() 
    this._content = undefined;

    if(this.eager) this.getContent();
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
   * async function, gets the content of the wc-route element
   */
  async getContent(){
    if(this.innerText.trim() != "") this._content = this.innerText
    if(this._content) return this._content

    const url = (new URL(this.file, location.href)).href
    console.log(url);
    const resp = await fetch(url);
    const text = await resp.text()

    this._content = text;
    this.innerHTML = text;
    return text;
  }
}

customElements.define("wc-route", WCRoute)
