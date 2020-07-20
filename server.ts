#!/usr/bin/env -S deno run --allow-net --allow-read
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This program serves files in the current directory over HTTP.
// TODO Stream responses instead of reading them into memory.
// TODO Add tests like these:
// https://github.com/indexzero/http-server/blob/master/test/http-server-test.js

import { posix, extname } from "https://deno.land/std/path/mod.ts";
import { listenAndServe, ServerRequest, Response } from "https://deno.land/std/http/server.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import { assert } from "https://deno.land/std/_util/assert.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";

interface EntryInfo {
  mode: string;
  size: string;
  url: string;
  name: string;
}

interface FileServerArgs {
  _: string[];
  // -p --port
  p: number;
  port: number;
  // --cors
  cors: boolean;
  // -h --help
  h: boolean;
  help: boolean;
}

const encoder = new TextEncoder();

const serverArgs = parse(Deno.args) as FileServerArgs;
const mainFile: string = posix.resolve(serverArgs._[0] ?? "./index.html");
const target = posix.resolve(serverArgs._[1] ?? "");

const MEDIA_TYPES: Record<string, string> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".ts": "text/typescript",
  ".tsx": "text/tsx",
  ".js": "application/javascript",
  ".jsx": "text/jsx",
  ".gz": "application/gzip",
  ".css": "text/css",
  ".wasm": "application/wasm",
};

/** Returns the content-type based on the extension of a path. */
function contentType(path: string): string | undefined {
  return MEDIA_TYPES[extname(path)];
}

function modeToString(isDir: boolean, maybeMode: number | null): string {
  const modeMap = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];

  if (maybeMode === null) {
    return "(unknown mode)";
  }
  const mode = maybeMode.toString(8);
  if (mode.length < 3) {
    return "(unknown mode)";
  }
  let output = "";
  mode
    .split("")
    .reverse()
    .slice(0, 3)
    .forEach((v): void => {
      output = modeMap[+v] + output;
    });
  output = `(${isDir ? "d" : "-"}${output})`;
  return output;
}

function fileLenToString(len: number): string {
  const multiplier = 1024;
  let base = 1;
  const suffix = ["B", "K", "M", "G", "T"];
  let suffixIndex = 0;

  while (base * multiplier < len) {
    if (suffixIndex >= suffix.length - 1) {
      break;
    }
    base *= multiplier;
    suffixIndex++;
  }

  return `${(len / base).toFixed(2)}${suffix[suffixIndex]}`;
}

export async function serveFile(
  req: ServerRequest,
  filePath: string,
): Promise<Response> {
  const [file, fileInfo] = await Promise.all([
    Deno.open(filePath),
    Deno.stat(filePath),
  ]);
  const headers = new Headers();
  headers.set("content-length", fileInfo.size.toString());
  const contentTypeValue = contentType(filePath);
  if (contentTypeValue) {
    headers.set("content-type", contentTypeValue);
  }
  req.done.then(() => {
    file.close();
  });
  return {
    status: 200,
    body: file,
    headers,
  };
}

function serverLog(req: ServerRequest, res: Response): void {
  const d = new Date().toISOString();
  const dateFmt = `[${d.slice(0, 10)} ${d.slice(11, 19)}]`;
  const s = `${dateFmt} "${req.method} ${req.url} ${req.proto}" ${res.status}`;
  console.log(s);
}

function setCORS(res: Response): void {
  if (!res.headers) {
    res.headers = new Headers();
  }
  res.headers.append("access-control-allow-origin", "*");
  res.headers.append(
    "access-control-allow-headers",
    "Origin, X-Requested-With, Content-Type, Accept, Range",
  );
}

function dirViewerTemplate(dirname: string, entries: EntryInfo[]): string {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Deno File Server</title>
        <style>
          :root {
            --background-color: #fafafa;
            --color: rgba(0, 0, 0, 0.87);
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --background-color: #303030;
              --color: #fff;
            }
          }
          @media (min-width: 960px) {
            main {
              max-width: 960px;
            }
            body {
              padding-left: 32px;
              padding-right: 32px;
            }
          }
          @media (min-width: 600px) {
            main {
              padding-left: 24px;
              padding-right: 24px;
            }
          }
          body {
            background: var(--background-color);
            color: var(--color);
            font-family: "Roboto", "Helvetica", "Arial", sans-serif;
            font-weight: 400;
            line-height: 1.43;
            font-size: 0.875rem;
          }
          a {
            color: #2196f3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          table th {
            text-align: left;
          }
          table td {
            padding: 12px 24px 0 0;
          }
        </style>
      </head>
      <body>
        <main>
          <h1>Index of ${dirname}</h1>
          <table>
            <tr>
              <th>Mode</th>
              <th>Size</th>
              <th>Name</th>
            </tr>
            ${
    entries.map(
      (entry) =>
        html`
                  <tr>
                    <td class="mode">
                      ${entry.mode}
                    </td>
                    <td>
                      ${entry.size}
                    </td>
                    <td>
                      <a href="${entry.url}">${entry.name}</a>
                    </td>
                  </tr>
                `,
    )
  }
          </table>
        </main>
      </body>
    </html>
  `;
}

function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  const l = strings.length - 1;
  let html = "";

  for (let i = 0; i < l; i++) {
    let v = values[i];
    if (v instanceof Array) {
      v = v.join("");
    }
    const s = strings[i] + v;
    html += s;
  }
  html += strings[l];
  return html;
}

function main(): void {
  const CORSEnabled = serverArgs.cors ? true : false;
  const addr = `0.0.0.0:${serverArgs.port ?? serverArgs.p ?? 4507}`;

  if (serverArgs.h ?? serverArgs.help) {
    console.log(`Default File Server
    Serves a local directory in HTTP, but serves the specified main file when the file is not found

  USAGE:
    file_server [mainFile] [path] [options]

  OPTIONS:
    path                The directory to serve
    mainFile            The main file to serve, this file is also served during 404's
    -h, --help          Prints help information
    -p, --port <PORT>   Set port
    --cors              Enable CORS via the "Access-Control-Allow-Origin" header`);
    Deno.exit();
  }

  if (!existsSync(mainFile)){
     console.log(`mainFile ${mainFile} not found, ensure you set the mainFile correctly when calling the script !`)
  }

  listenAndServe(
    addr,
    async (req): Promise<void> => {
      let normalizedUrl = posix.normalize(req.url);
      try {
        normalizedUrl = decodeURIComponent(normalizedUrl);
      } catch (e) {
        if (!(e instanceof URIError)) {
          throw e;
        }
      }
      let fsPath = posix.join(target, normalizedUrl);
      if(fsPath.endsWith("/")){
          fsPath += "index.html"
      }
      console.log('asds', fsPath);

      let response: Response | undefined;

      try{
        const fileInfo = await Deno.stat(fsPath);
        response = await serveFile(req, fsPath);
      } catch(e) {
        const fileInfo = await Deno.stat(mainFile);
        response = await serveFile(req, mainFile);
      }

      if (CORSEnabled) {
        assert(response);
        setCORS(response);
      }
      serverLog(req, response!);
      try {
        await req.respond(response!);
      } catch (e) {
        console.error(e.message);
      }
    },
  );

  console.log(`HTTP server listening on http://${addr}/`);
}

if (import.meta.main) {
  main();
}
