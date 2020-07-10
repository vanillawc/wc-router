export default class RA extends HTMLElement{
  constructor(){
    super()
    this.addEventListener("click", () => {
      const href = this.getAttribute('href')
      const url = new URL(href, window.location.href);
      wcrouter.mainrouter.setRoute(url.pathname)
    })
  }
}


customElements.define("r-a", RA)
