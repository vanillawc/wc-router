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

- new concept : every time a page changes, the page calls the event `routeChange` in the `wcrouter` window variable, the event handler is passed the currentRoute via `e.detail.currentRoute`

using these concepts we can change the code to
```html
<html>
  <head>
    <title>simple wc-router tutorial</title>
    <script type="module" src="https://cdn.jsdelivr.net/gh/vanillawc/wc-router@2/src/index.js"></script>
    <script type="module">
      wcrouter.addEventListener("routeChange", e => {
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

## dividing html in routes

you often might need to use more html in routes, you may load them into the `<wc-route>` via the `file` parameter, for example: `<wc-route path="/location" file="/path/to/my/file.html">`

## r-a tags

- you'd have noticed we've used `r-a` tags to navigate here instead of `a` tags, these use the internal `history` api to navigate between pages, while `a` tags would also work, navigation via `r-a` tags should be smoother

## routeChange vs routeLoad

wcrouter have 2 events `routeChange` (displayed above) and `routeLoad`, `routeChange` is called every time a route is loaded, `routeLoad` is only called the first time a page is loaded, meaning that if the user (without reloading the page or during navigation) goes to another page and comes back to the same page, `routeLoad` will not be called when he comes back, it'll only be called the first time he visits the page, `routeChange` will be called every time the user visits the page
