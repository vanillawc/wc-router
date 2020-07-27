wc-router
--------

go up, go down, now turn left, nope its not there


## Installation

script tags:
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-router@1/src/index.js">
```

## Usage NOTE

- production ready: **yes !**
- lazy loading is default behaviour, put the "eager" attribute to change this !,

### Tags here

- `<wc-router-options>`
- `<wc-router>`
- `<wc-route>`
- `<r-a>`


## Usage example

### Routing

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

- if a route part starts with **":"**, for example in **"/:variable/page4"**, here, the link may contain any variable in its place (for example, "/alex/page4", "/jeremy/page4", "/clarkson/page4") , and the link will redirect to this location, also note, all variables are accessable via **window.wcrouter.params** in javascript
- if a route part starts with **"path:"**, for example in **"/abc/path:all"** or **"/path:all"**, any route at and after this path (for example, with "/abc/path:all", "/abc/def", "/abc/ghi" ...) will redirect to this page, again, all there variables/paths are visible in **window.wcrouter.params**
- evaluation of wc-routes happens in order of appearance 


### Linking

```html
<r-a href="/page3">link to page 3 !</r-a>
```

## Usage via Javascript

- to reroute via javascript use, **"wcrouter.route(url)"**

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
- **events-loc**: If you want to load javascript events when a page loads, place them here, the following functions exported in the module mean the following, (all names are optional)
  - **load** - if a load function is exported, it'll be called after the wc-route loads, the wc-route element is passed on to the function
  - **teardown** - if a teardown function is exported, it'll be called when the route changes, the wc-route element is passed on the function

[boolean attribute]: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Boolean_Attributes

### Serving files (with a test server)
`deno run --allow-net --allow-read --unstable https://cdn.jsdelivr.net/gh/vanillawc/wc-router@1/server.ts <main_file_name>`

## testing the code here

- install [deno](https://deno.land/#installation)
- install [velociraptor](https://github.com/umbopepato/velociraptor)
- run the test file with `vr test`
