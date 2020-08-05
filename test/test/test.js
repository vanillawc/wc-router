const assert = require('assert');
const puppeteer = require('puppeteer')
const express = require('express');
const path = require('path');

let browser, page, server;

before(async function(){
  this.timeout(10000)
  // start server
  const app = express();
  const testHTMLPath = path.join(__dirname, '../test.html')
  app.get('/', (req, res) => res.sendFile(testHTMLPath))
  app.use('/test', express.static('../test'))
  app.use('/src', express.static('../src'))
  app.use((req, res) => {
    res.status(404).sendFile(testHTMLPath)
  })
  const port = 42414
  server = app.listen(port);

  // start puppeteer
  browser = await puppeteer.launch()
  page = await browser.newPage()
  await page.goto(`http://localhost:${port}/`)
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

    it("tests non-lazy loading of a page and fullyActive variable", async () => {
      await page.click('r-a[href="/one-level/two-level/3/4/5/6"]')
      await new Promise(res => setTimeout(res, 50))
      const checkHasAttribute = () => {
        return window.wcrouter.getMatchingRoute("/one-level/two-level/3/4/5/6").wcroute.hasAttribute("current")
      }
      const hasAttribute = (await page.evaluate(checkHasAttribute))
      assert.ok(hasAttribute)

      const title = await page.title()
      assert.equal(title, "six level page")

      const query = "wc-route[path='/one-level/two-level/3/4/5/6']"
      assert.ok(await page.evaluate(q => document.querySelector(q).fullyActive, query))

      await page.goBack()
      assert.ok(!await page.evaluate(q => document.querySelector(q).fullyActive, query))
    })

    it("tests lazy loading of a page", async () => {
      await page.click('r-a[href="/somewhere"]')
      await new Promise(res => setTimeout(res, 100))
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

    it("check page change event dispatch, hidden event dispatch and firstLoad Variable", async () => {
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
        const mainWcroute = document.querySelector("wc-route[path='/']")
        const _switch = new Promise(res => wcroute.addEventListener("shown", res))
        const switchCL = new Promise(res => wcroute.addEventListener("shownContentLoaded", res))
        const mainHidden = new Promise(res => mainWcroute.addEventListener("hidden", res))
        return Promise.all([routeChange, 
                            routeChangeContentLoaded, 
                            _switch, 
                            switchCL, 
                            mainHidden])
      };
      const firstLoad = (await page.evaluate(getFirstLoad))[0].currentRoute.firstLoad
      assert.ok(!firstLoad)
      await page.goBack()
    })

    it("tests loading a page with a base", async () => {
      await page.click('r-a[href="/route/with/base"]')
      await new Promise(res => setTimeout(res, 50))

      const checkroutecontents = async () => {
        const route = document.getElementById("base1")
        return route.innerHTML
      }
      const innerHTML = (await page.evaluate(checkroutecontents))
      const expected = `<p>this is a route base</p>
<r-a href="/route/with/base">route1 in this base</r-a>
<br>
<r-a href="/route/with/base/2">another route in this base</r-a>
<wc-route-insert><wc-route path="/route/with/base" file="/test/test_files/base1_route1.html" current="" style=""><p>this is the route content inside the base</p>
</wc-route><wc-route path="/route/with/base/2">another route inside a base</wc-route></wc-route-insert>`
      assert.strictEqual(innerHTML.trim(), expected)
      await page.goBack()
    })

    it("tests loading another page with a base", async () => {
      await page.click('r-a[href="/route/with/base/2"]')
      const checkroutecontents = async () => {
        await new Promise(res => setTimeout(res, 50))
        const route = document.getElementById("base1")
        return route.innerHTML
      }
      const innerHTML = (await page.evaluate(checkroutecontents))
      const expected = `<p>this is a route base</p>
<r-a href="/route/with/base">route1 in this base</r-a>
<br>
<r-a href="/route/with/base/2">another route in this base</r-a>
<wc-route-insert><wc-route path="/route/with/base" file="/test/test_files/base1_route1.html" style=""><p>this is the route content inside the base</p>
</wc-route><wc-route path="/route/with/base/2" current="" style="">another route inside a base</wc-route></wc-route-insert>`
      assert.strictEqual(innerHTML.trim(), expected)
      await page.goBack()
    })


    it("check page base load and event dispatch/contentLoaded variable", 
      async () => { 
      const waitRouteLoad = () => {
        const wcrouter = window.wcrouter
        const wcroute = document.querySelector("wc-route[path='/route/with/nested/base/2']")
        const base = wcroute.bases[0]
        const load = new Promise(res => base.addEventListener("load", e => res(e.detail)))
        const loadCL = new Promise(res => base.addEventListener("loadContentLoaded", res))

        return Promise.all([load, loadCL])
      }

      const detail = (await Promise.all([page.click('r-a[href="/route/with/nested/base/2"]'), 
                                         page.evaluate(waitRouteLoad)]))[1][0]
      assert.ok(detail.routeBase.fullyActive) 
      assert.ok(detail.routeBase.contentLoaded) 
      await page.goBack()

      const query = "wc-route[path='/route/with/nested/base/2']"
      assert.ok(!await page.evaluate(q => document.querySelector(q).fullyActive, query))
    })

    it("check page base change and event dispath", 
      async () => { 
      const waitRouteLoad = () => {
        const wcrouter = window.wcrouter
        const wcroute = document.querySelector("wc-route[path='/route/with/nested/base/2']")
        const base = wcroute.bases[0]
        const load = new Promise(res => base.addEventListener("change", e => res(e.detail)))
        const loadCL = new Promise(res => base.addEventListener("changeContentLoaded", res))

        return Promise.all([load, loadCL])
      }

      const detail = (await Promise.all([page.click('r-a[href="/route/with/nested/base/2"]'), 
                                         page.evaluate(waitRouteLoad)]))[1][0]
      assert.ok(detail.routeBase.fullyActive) 
      await page.goBack()

      const query = "wc-route[path='/route/with/nested/base/2']"
      assert.ok(!await page.evaluate(q => document.querySelector(q).fullyActive, query))
    })

    it("tests loading another page with a nested base", async () => {
      await page.click('r-a[href="/route/with/nested/base"]')

      // required to mention base 3 as there are multiple r-a with the same href,
      // and query selector selects the first one
      await page.click('#base3 r-a[href="/route/with/nested/base/2"]')
      const checkroutecontents = async () => {
        const route = document.getElementById("base3")
        return route.innerHTML
      }
      const innerHTML = (await page.evaluate(checkroutecontents))
      const expected = `<p>base loaded without file parameter, in a nested base</p>
        <r-a href="/route/with/nested/base">route 1 (in only the parent base)</r-a><br>
        <r-a href="/route/with/nested/base/2">route 2 (in the nested base)</r-a><br>
        <r-a href="/route/with/nested/base/3">route 3 (in the nested base)</r-a><br>
        <wc-route-insert>
          <wc-route path="/route/with/nested/base" style="">route 1, in the parent base</wc-route> 
          <wc-route-base current="">
            <p>the nested base</p>
            <wc-route-insert>
              <wc-route path="/route/with/nested/base/2" style="" current="">route 2</wc-route>
              <wc-route path="/route/with/nested/base/3">route 3</wc-route>
            </wc-route-insert>
          </wc-route-base>
        </wc-route-insert>`
      assert.strictEqual(innerHTML.trim(), expected)

      // TWICE cause we navigated twice
      await page.goBack()
      await page.goBack()
    })
  });
});


