![wc router logo](logo.svg)

wc-router
--------
go up, go down, now turn left, nope its not there

## Installation

script tags:
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-router@2/src/index.js"></script>
```

## Usage NOTE

- production ready: **yes !**
- lazy loading is default behaviour, put the "eager" attribute to change this !,

### Tags here

- `<wc-route-base>`
- `<wc-route-insert>`
- `<wc-router>`
- `<wc-route>`
- `<r-a>`


## Usage example

**Note :** see a usage guide [here](https://github.com/vanillawc/wc-router/blob/master/usage-guide.md)

### Routing

```html
<!--
<wc-route-base> tags contain common html, the html inside these tags
is loaded first, then if the <wc-route-base> tags html contains a 
<wc-route-insert> tag, this tag is replaced with the contents of the 
<wc-route> tag, and then the route is rendered and shown
-->
<wc-router>
  <wc-route path="/" file="/pages/page1.html" p-title="page 1"></wc-route>
  <wc-route path="/page2" file="/pages/page2.html" p-title="page 2"></wc-route>
  <wc-route path="/page3" file="/pages/page3.html" p-title="page 3" eager></wc-route>
  <wc-route-base file="/pages/cats/base.html">
    <wc-route path="/cat/albert" file="/pages/cats/albert.html" p-title="albert the cat"></wc-route>
    <wc-route path="/cat/betty" file="/pages/cats/betty.html" p-title="betty the cat"></wc-route>
  </wc-route-base>
  <wc-route path="/:variable/page4" file="/pages/page4.html" eager></wc-route>
  <wc-route path="/abc/path:all" file="/pages/catch-all-abc.html"></wc-route>
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

### rerouting

- to reroute via javascript use, **"wcrouter.route(url)"**

### wcrouter events

these events are accessable via the window wcrouter variable

i.e. `window.wcrouter.addEventListener(<event-name>, <callback>)`

- **routeLoad**:
  - **when :** called the first time a route is loaded
  - **usage :** heavy pre content loading operations
  - **callback parameters:**
    + **event.detail.currentRoute**: the current route

- **routeChange**:
  - **when :** called every time a route change
  - **usage :** heavy pre content loading operations
  - **callback parameters:**
    + **event.detail.currentRoute**: the current route

- **routeLoadContentLoaded**:
  - **when :** called the first time a route is loaded, and its content is loaded
  - **callback parameters:**
    + **event.detail.currentRoute**: the current route

- **routeChangeContentLoaded**:
  - **when :** called every time a route change occurs, and the routes content is loaded
  - **callback parameters:**
    + **event.detail.currentRoute**: the current route

### wc-route/wc-route-base events

these events occur in every `<wc-route>` object

i.e. something like 

```html
document.querySelector("wc-route[path='/some/path']").addEventListener(event, callback)
```

- **load**:
  - **when :** called the first time a route/base is loaded
  - **usage :** heavy pre content loading operations
  - **callback parameters:**
    + **event.detail.wcroute**: this route
    + **event.detail.waitForContent**: (function that returns a promise) wait for the content to load

- **loadContentLoaded**:
  - **when :** called the first time a route/base is loaded
  - **usage :** dom operations
  - **callback parameters:**
    + **event.detail.wcroute**: this route

- **shown**:
  - **when :** called every time a route/base is rendered
  - **usage :** heavy pre content loading operations
  - **callback parameters:**
    + **event.detail.wcroute**: this route
    + **event.detail.waitForContent**: (function that returns a promise) wait for the content to load

- **shownContentLoaded**:
  - **when :** called every time a route/base is rendered
  - **usage :** dom operations
  - **callback parameters:**
    + **event.detail.wcroute**: this route

- **hidden**:
  - **when :** called every time a route/base is hidden
  - **usage :** dom operations
  - **callback parameters:**
    + **event.detail.wcroute**: this route

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
- **p-title**: the to-set page title

[boolean attribute]: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Boolean_Attributes

### wc-route

### Serving files (with a test server)
`deno run --allow-net --allow-read --unstable https://cdn.jsdelivr.net/gh/vanillawc/wc-router@2/server.ts <main_file_name>`

## testing the code here

- install [deno](https://deno.land/#installation)
- install [node](https://nodejs.org/en/)
- install testing dependencies,
  + go into the test directory (via `cd test`)
  + npm i
  + go back to the main directory
- install [velociraptor](https://github.com/umbopepato/velociraptor)
- run the test file with `vr test`
