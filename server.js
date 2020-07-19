import { Application } from "https://deno.land/x/oak/mod.ts";
import { existsSync, readFileStrSync } from "https://deno.land/std/fs/mod.ts";

const app = new Application();

const file = Deno.args[0]

if(!file) throw Error("you've to specify a main file !, ./server.js <file_name>")

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
    ctx.response.body = readFileStrSync(file, { encoding: "utf8" })
  }
});


console.log("listening on port:8000")
console.log("open with http://localhost:8000")
console.log("default file : ", file)
await app.listen({ port: 8000 });
