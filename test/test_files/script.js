document
  .querySelector("wc-route[path='/']")
    .addEventListener("load", async ({detail}) => {
      await detail.waitForContent()
     })
