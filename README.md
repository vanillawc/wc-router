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
  <wc-route main file="/pages/page1.html"></wc-route>
  <wc-route path="/page2" file="/pages/page2.html"></wc-route>
  <wc-route path="/page3" file="/pages/page3.html" eager></wc-route>
  <wc-route file="/pages/catch-all.html" catch-all></wc-route>
</wc-router>
```

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
- **catch-all**: ([boolean attribute]) if this represents the catch all
- **live-reload**: loads the file every time the page is navigated to, instead of caching it

[boolean attribute]: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Boolean_Attributes

### Serving files (with a test server)
`deno run --allow-net --allow-read --unstable https://cdn.jsdelivr.net/gh/vanillawc/wc-router@0/src/server.ts <main_file_name>`
