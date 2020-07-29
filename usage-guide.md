# wc-router usage guide !

(you can find this complete example in the `/example` directory in the github repo)

- **note**, this example requires [deno](https://deno.land/#installation), ensure you install it before running this example, we require this to setup a server that sets the 404 route of a page to `index.html`, this is required for the navigational capabilities of `wc-router`

 - in a new folder (name it whatever you want), create a file called `index.html`, and add this in the contents

```html
<html>
  <head>
    <title>simple wc-router tutorial</title>
    <script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-router@2/src/index.js"></script>
  </head>
  <body>
    <wc-router>
      <wc-route path="/">hi there, check out <r-a href="/howdy">the howdy page</r-a> !</wc-route>
      <wc-route path="/howdy">howdy yo!</wc-route>
    </wc-router>
  </body>
</html>
```

- now run the file via `deno run --allow-net --allow-read --unstable https://cdn.jsdelivr.net/gh/vanillawc/wc-router@2/server.ts`

- now open a sample web browser, navigate to `https://localhost:4507`, and you should see

`hi there, check out the howdy page !`

with "the howdy page" in blue, and underlined

- go ahead and click "the howdy page" !, you should see

`howdy yo !`

now check the navigation bar - you should've navigated to "/howdy" !

thats amazing !, you've now completed the basics of wc-route !

## complex routing

 - hey, what if I wish that someone can go to `/howdy/<their_name>` with their name, like `/howdy/andy` or `/howdy/rachel` and reach the howdy page ?

well, we'll have to use slightly more complex routing then, we'll have to setup another `wc-route` for this

- go ahead and add 

```html
<wc-route path="/howdy/:name">howdy yo !</wc-route>
```

inside the `<wc-router>`

your final html should look like

```html
<html>
  <head>
    <title>simple wc-router tutorial</title>
    <script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-router@2/src/index.js"></script>
  </head>
  <body>
    <wc-router>
      <wc-route path="/">hi there, check out <r-a href="/howdy">the howdy page</r-a> !</wc-route>
      <wc-route path="/howdy">howdy yo!</wc-route>
      <wc-route path="/howdy/:name">howdy yo !</wc-route>
    </wc-router>
  </body>
</html>
```

- now navigate to `https://localhost:4507/howdy/alex` or `https://localhost:4507/howdy/<your_name>` in a web browser, and you should see

`howdy yo!`

### whats going on here

- adding `:` before a route path captures all variables at that route path (and you can access this via javascript, we'll see this in the next section)

- these variables can be present anywhere (such as in the middle `/howdy/:name/whatsup`), not just in the end

## javascript access

- what if I wanna make it say `howdy <the_persons_name> !`

- new concept: all variables in navigation bar are accessable via `wcrouter.params`, through the window wcrouter variable, so we'll have to dynamically use these

- new concept : every time a page changes, the page calls the event `routeChangeContentLoaded` in the `wcrouter` window variable, the event handler is passed the currentRoute via `e.detail.currentRoute`

using these concepts we can change the code to
```html
<html>
  <head>
    <title>simple wc-router tutorial</title>
    <script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-router@2/src/index.js"></script>
    <script type="module">
      wcrouter.addEventListener("routeChangeContentLoaded", e => {
        if(e.detail.currentRoute.path === "/howdy/:name"){
          e.detail.currentRoute.innerHTML = `howdy ${wcrouter.params.name} !`
        }
      })
    </script>
  </head>
  <body>
    <wc-router>
      <wc-route path="/">hi there, check out <r-a href="/howdy">the howdy page</r-a> !</wc-route>
      <wc-route path="/howdy">howdy yo!</wc-route>
      <wc-route path="/howdy/:name">howdy yo !</wc-route>
    </wc-router>
  </body>
</html>
```

and save it, now visit `http://localhost:4507/howdy/ald`, and you should see `howdy ald !`

## 404 page

- oh no, what if my user accesses a page that does not exist !, how do I tell him that ?

well, fear not, we'll add an additional path `<wc-route path="/path:everything:>` at the very end

like,

```html
<html>
  <head>
    <title>simple wc-router tutorial</title>
    <script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-router@2/src/index.js"></script>
    <script type="module">
      wcrouter.addEventListener("routeChangeContentLoaded", e => {
        if(e.detail.currentRoute.path === "/howdy/:name"){
          e.detail.currentRoute.innerHTML = `howdy ${wcrouter.params.name} !`
        }
      })
    </script>
  </head>
  <body>
    <wc-router>
      <wc-route path="/">hi there, check out <r-a href="/howdy">the howdy page</r-a> !</wc-route>
      <wc-route path="/howdy">howdy yo!</wc-route>
      <wc-route path="/howdy/:name">howdy yo !</wc-route>
      <wc-route path="/path:everything">oh no this page does not exist, go back <r-a href="/">home</r-a>!</wc-route>
    </wc-router>
  </body>
</html>
```

- now try navigating to a page that does not exist, like `http://localhost:4507/asda/` and you should see

`oh no this page does not exist, go back home!`

## dividing html in routes

you often might need to use more html in routes, you may load them into the `<wc-route>` via the `file` parameter, for example: `<wc-route path="/location" file="/path/to/my/file.html">`

## r-a tags

- you'd have noticed we've used `r-a` tags to navigate here instead of `a` tags, these use the internal `history` api to navigate between pages, while `a` tags would also work, navigation via `r-a` tags should be smoother

## routeChange vs routeChangeContentLoaded

routeChange is called before the dom content is loaded, routeChangeContentLoaded is called after the dom content is loaded

## routeChangeContentLoaded vs routeLoadContentLoaded

wcrouter 2 events `routeChangeContentLoaded` (displayed above) and `routeLoadContentLoaded`, `routeChangeContentLoaded` is called every time a route is loaded, `routeLoadContentLoaded` is only called the first time a page is loaded, meaning that if the user (without reloading the page or during navigation) goes to another page and comes back to the same page, `routeLoadContentLoaded` will not be called when he comes back, it'll only be called the first time he visits the page, `routeChangeContentLoaded` will be called every time the user visits the page
