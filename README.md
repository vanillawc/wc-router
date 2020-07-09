wc-router
--------

go up, go down, now turn left, nope its not there


## Installation

todo


## Usage NOTE

- **production ready:** nope, definitely not


## Usage example

**Usage note** : 
lazy loading is default behaviour, put the "eager" attribute to change this !,
you may add it per router/per route

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
- **eager**: get files in advance
-
