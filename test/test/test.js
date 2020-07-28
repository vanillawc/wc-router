const assert = require('assert');
const puppeteer = require('puppeteer')
const express = require('express');
const path = require('path');

let browser, page, server;

before(async function(){
  // start server
  const app = express();
  const testHTMLPath = path.join(__dirname, '../test.html')
  app.get('/', (req, res) => res.sendFile(testHTMLPath))
  app.use('/test', express.static('../test'))
  app.use('/src', express.static('../src'))
  app.use((req, res) => {
    res.status(400)
    res.render(testHTMLPath)
  })
  server = app.listen(3000);

  // start puppeteer
  browser = await puppeteer.launch()
  page = await browser.newPage()
});

after(async () => {
  server.close()
  await browser.close()
})

describe('all tests', async function () {
  this.timeout(10000) 
  describe('path matching', async function () {
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
  });

  describe("test non-lazy-loading", async () => {
    it("tests lazy loading of a page", async () => {
      await page.click('r-a[href="/one-level/two-level/3/4/5/6"]')
      await new Promise(res => setTimeout(res, 50))
      const innerHTML = (await page.evaluate(() => document.body.innerHTML))
      assert.ok(innerHTML.includes("this is a 6-level page"))
      await page.goBack()
    })
  })

  describe("test lazy-loading", async () => {
    it("tests lazy loading of a page", async () => {
      await page.click('r-a[href="/somewhere"]')
      await new Promise(res => setTimeout(res, 500))
      const innerHTML = (await page.evaluate(() => document.body.innerHTML))
      assert.ok(innerHTML.includes("some page with a variable at the top level"))
      await page.goBack()
    })
  })

  describe("test route load event dispatch", async () => {
    it("checks what it needs to", async () => {
      page.click('r-a[href="/one-level/two-level/3/4/5/6"]')
      const waitRouteChange = () => {
        return new Promise(res => window.wcrouter.addEventListener("routeLoad",res))
      }
      await page.evaluate(waitRouteChange)
      await page.goBack()
    })
  })

  describe("test route change event dispatch, and WCRoute.firstLoad variable", async () => {
    it("checks what it needs to", async () => {
      page.click('r-a[href="/one-level/two-level/3/4/5/6"]')
      const getFirstLoad = () => {
        return new Promise(res => window
                            .wcrouter
                            .addEventListener("routeChange", e => res(e.detail.currentRoute.firstLoad)))
      };
      const firstLoad = await page.evaluate(getFirstLoad)
      assert.ok(!firstLoad)
    })
  })
});

