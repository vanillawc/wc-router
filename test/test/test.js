const assert = require('assert');
const puppeteer = require('puppeteer')
const express = require('express');
const path = require('path');

let browser, page, server;

before(async function(){
  this.timeout(4000)
  // start server
  const app = express();
  const testHTMLPath = path.join(__dirname, '../test.html')
  app.get('/', (req, res) => res.sendFile(testHTMLPath))
  app.use('/test', express.static('../test'))
  app.use('/src', express.static('../src'))
  app.use((req, res) => {
    res.status(404).sendFile(testHTMLPath)
  })
  server = app.listen(3000);

  // start puppeteer
  browser = await puppeteer.launch()
  page = await browser.newPage()
  await new Promise(res => setTimeout(res, 500))
});

after(async () => {
  server.close()
  await browser.close()
})

describe('all tests', function () {
  this.timeout(1500) 
  describe('all tests', async function () {
    it('matches a 1 level absolute path correctly', async function () {
      await page.goto('http://localhost:3000/')
      const routepath = "/one-level"
      const getRouteFn = routepath => (window
                                         .wcrouter
                                         .getMatchingRoute(routepath)
                                         .wcroute.innerHTML);
      const wcrouteInner = await page.evaluate(getRouteFn, routepath)
      assert.ok(wcrouteInner.includes("this is a one-level page"))
    });

    it('matches a 2 level absolute path correctly', async function () {
      const routepath = "/one-level/two-level"
      const getRouteFn = routepath => (window
                                         .wcrouter
                                         .getMatchingRoute(routepath)
                                         .wcroute.innerHTML);
      const wcrouteInner = await page.evaluate(getRouteFn, routepath)
      assert.ok(wcrouteInner.includes("this is a two-level page"))
    });

    it('matches a 6 level absolute path correctly', async function () {
      const routepath = "/one-level/two-level/3/4/5/6"
      const getRouteFn = routepath => (window
                                         .wcrouter
                                         .getMatchingRoute(routepath)
                                         .wcroute.innerHTML);
      const wcrouteInner = await page.evaluate(getRouteFn, routepath)
      assert.ok(wcrouteInner.includes("this is a 6-level page"))
    });

    it('matches a path with a variable at level 1', async () => {
      const routepath = "/random-something"
      const getRouteFn = routepath => {
        const route = window 
                    .wcrouter
                    .getMatchingRoute(routepath);
        const a = route.wcroute.innerHTML;
        const b = route.matchDetails.params;
        return [a, b]
      };
      const [wcrouteInner, params] = (await page.evaluate(getRouteFn, routepath))
      assert.equal(params.anything, "random-something")
    })

    it('matches a path with a variable at the center of the route', async () => {
      const routepath = "/something/someVariable/someOtherThing"
      const getRouteFn = routepath => {
        const route = window 
                    .wcrouter
                    .getMatchingRoute(routepath);
        const a = route.wcroute.innerHTML;
        const b = route.matchDetails.params;
        return [a, b]
      };
      const [wcrouteInner, params] = (await page.evaluate(getRouteFn, routepath))
      assert.ok(wcrouteInner.includes("some page with a variable in the center"))
      assert.equal(params.pageVariable, "someVariable")
    })

    it('matches a complex path', async () => {
      const routepath = "/something/bob1/words/bob2/someOtherThing"
      const getRouteFn = routepath => {
        const route = window 
                    .wcrouter
                    .getMatchingRoute(routepath);
        const a = route.wcroute.innerHTML;
        const b = route.matchDetails.params;
        return [a, b]
      };
      const [wcrouteInner, params] = (await page.evaluate(getRouteFn, routepath))
      assert.ok(wcrouteInner.includes("some other page with 2 variables"))
      assert.equal(params.pageVariable, "bob1")
      assert.equal(params.pageVariable2, "bob2")
    })

    it('matches catch-all path', async () => {
      const routepath = "/some/non/existant/route"
      const getRouteFn = routepath => {
        const route = window 
                    .wcrouter
                    .getMatchingRoute(routepath);
        const a = route.wcroute.innerHTML;
        const b = route.matchDetails.params;
        return [a, b]
      };
      const [wcrouteInner, params] = (await page.evaluate(getRouteFn, routepath))
      assert.ok(wcrouteInner.includes("this is the catch-all page"))
      assert.deepStrictEqual(params.value, ['some', 'non', 'existant', 'route'])
    })

    it("tests non-lazy loading of a page", async () => {
      await page.click('r-a[href="/one-level/two-level/3/4/5/6"]')
      await new Promise(res => setTimeout(res, 50))
      const innerHTML = (await page.evaluate(() => document.body.innerHTML))
      assert.ok(innerHTML.includes("this is a 6-level page"))
      await page.goBack()
    })

    it("tests lazy loading of a page", async () => {
      await page.click('r-a[href="/somewhere"]')
      await new Promise(res => setTimeout(res, 500))
      const innerHTML = (await page.evaluate(() => document.body.innerHTML))
      assert.ok(innerHTML.includes("some page with a variable at the top level"))
      await page.goBack()
    })

    it("check page load and event dispatch/firstLoad variable/contentLoaded variable", 
      async () => { 
      const waitRouteLoad = () => {
        const wcrouter = window.wcrouter
        const routeLoad = new Promise(res => wcrouter
                                              .addEventListener("routeLoad",
                                                                e => res(e.detail)))
        const routeLoadContentLoaded = new Promise(res => wcrouter
                                                            .addEventListener(
                                                                "routeLoadContentLoaded",
                                                                e => res(e.detail)))

        const wcroute = document.querySelector("wc-route[path='/test-load-route']")
        const load = new Promise(res => wcroute.addEventListener("load", res))
        const loadCL = new Promise(res => wcroute.addEventListener("loadContentLoaded", res))

        return Promise.all([routeLoad, routeLoadContentLoaded, load, loadCL])
      }

      const detail = (await Promise.all([page.click('r-a[href="/test-load-route"]'), 
                                         page.evaluate(waitRouteLoad)]))[1][1]
      assert.ok(detail.currentRoute.firstLoad) 
      assert.ok(detail.currentRoute.contentLoaded)
      await page.goBack()
    })

    it("check page change event dispatch and firstLoad Variable", async () => {
      page.click('r-a[href="/test-load-route"]')
      const getFirstLoad = () => {
        const routeChange = new Promise(res => window
                                              .wcrouter
                                              .addEventListener("routeChange",
                                                                e => res(e.detail)))
        const routeChangeContentLoaded = new Promise(res => window
                                              .wcrouter
                                              .addEventListener("routeChangeContentLoaded",
                                                                e => res(e.detail)))

        const wcroute = document.querySelector("wc-route[path='/test-load-route']")
        const _switch = new Promise(res => wcroute.addEventListener("shown", res))
        const switchCL = new Promise(res => wcroute.addEventListener("shownContentLoaded", res))
        return Promise.all([routeChange, routeChangeContentLoaded, _switch, switchCL])
      };
      const firstLoad = (await page.evaluate(getFirstLoad))[0].currentRoute.firstLoad
      assert.ok(!firstLoad)
      await page.goBack()
    })
  });
});


