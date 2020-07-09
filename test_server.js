import { Application } from "https://deno.land/x/oak/mod.ts";
import { existsSync, readFileStrSync } from "https://deno.land/std/fs/mod.ts";

const app = new Application();


app.use((ctx) => {
  const path = ctx.request.url.pathname
  console.log("requested file:", "." + path, "file exists:", existsSync("." + path))
  if(existsSync("." + path) && !(path === "/")){
    ctx.response.body = readFileStrSync("." + path, { encoding: "utf8" })

    if(path.endsWith(".js"))
      ctx.response.headers.set("content-type",	"application/javascript; charset=utf-8")
    else if(path.endsWith(".css"))
      ctx.response.headers.set("content-type",	"text/css; charset=utf-8")
  }
  else{
    ctx.response.body = readFileStrSync("./test.html", { encoding: "utf8" })
  }
});

await app.listen({ port: 8000 });
