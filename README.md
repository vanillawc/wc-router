wc-router
--------

go up, go down, now turn left, nope its not there


## Installation

todo


## Usage NOTE

- production ready: **nope**, definitely not
- lazy loading is default behaviour, put the "eager" attribute to change this !,


## Usage example


## testing

- install [deno](https://deno.land/#installation)
- install [velociraptor](https://github.com/umbopepato/velociraptor)
- run the test file with `vr test`
- open `localhost:8000` in a browser

### Routing

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
<wc-ra href="/page3"></wc-ra>
```

## Attributes

### wc-router
- **eager**: get files in advance

### wc-route
- **eager**: ([boolean attribute]) get files in advance
- **file**: the file to load
- **path**: the path the wc-route represents
- **catch-all**: ([boolean attribute]) if this represents the catch all

[boolean attribute]: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Boolean_Attributes
