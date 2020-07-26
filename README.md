wc-router
--------

go up, go down, now turn left, nope its not there


## Installation

script tags:
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-router@0/src/index.js">
```

## Usage NOTE

- production ready: **nope**, definitely not
- lazy loading is default behaviour, put the "eager" attribute to change this !,

## testing

- install [deno](https://deno.land/#installation)
- install [velociraptor](https://github.com/umbopepato/velociraptor)
- run the test file with `vr test`
- open `localhost:8000` in a browser

### Tags

- `<wc-router-options>`
- `<wc-router>`
- `<wc-route>`
- `<r-a>`

### Routing

## Usage example

```html
<wc-router>
  <wc-route path="/" file="/pages/page1.html"></wc-route>
  <wc-route path="/page2" file="/pages/page2.html"></wc-route>
  <wc-route path="/page3" file="/pages/page3.html" eager></wc-route>
  <wc-route path="/:variable/page4" file="/pages/page3.html" eager></wc-route>
  <wc-route path="/abc/path:all" file="/pages/catch-all.html"></wc-route>
  <wc-route path="/path:all" file="/pages/catch-all.html"></wc-route>
</wc-router>
```

- if a route part starts with **":"**, for example in **"/:variable/page4"**, here, the link may contain any variable in its place, and the link will redirect to this location, also note, this variables is accessable via **"window.wcrouter.params"**
- if a route part starts with **"path:"**, for example in **"/abc/path:all"** or **"/path:all"**, any route at and after this path will redirect to this page, again, the parts of this route will be visible in **window.wcrouter.params**
- evaluation of wc-routes happens in order of appearance 

### Linking

```html
<r-a href="/page3"></r-a>
```

## Attributes

### wc-router
- **eager**: get files in advance

### wc-route
- **eager**: ([boolean attribute]) get files in advance
- **file**: the file to load
- **path**: the path the wc-route represents
  - parts of a route are seperated by slashes, eg: **"/asbas/asvdsad/asds"**
  - if you start a route-part with a ":" for eg: **"/asdcasdc/:param/def**, its treated as a string (and is visible from the 'wcrouter' variable in the window, in 'wc-router.params', with the word after ':' as the variable)
  - if you start a route-part with "path:", eg: **"/asadc/path:sometgin"**, note this is only possible for route-parts in the end, all further part parts will be visible in 'wc-router.params["your-var"]'
- **live-reload**: loads the file every time the page is navigated to, instead of caching it

[boolean attribute]: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Boolean_Attributes

### Serving files (with a test server)
`deno run --allow-net --allow-read --unstable https://cdn.jsdelivr.net/gh/vanillawc/wc-router@0/src/server.ts <main_file_name>`
