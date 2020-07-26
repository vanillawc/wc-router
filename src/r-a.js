export default class RA extends HTMLElement{
  constructor(){
    super()
    this.addEventListener("click", () => {
      const href = this.getAttribute('href')
      const url = new URL(href, window.location.href);
      wcrouter.route(url.pathname)
    })
  }
}


customElements.define("r-a", RA)
