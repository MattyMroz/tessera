import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const ROOT = resolve(import.meta.dirname, '../out')
const CONTENT_TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

function fileFor(url: string): string | undefined {
  const path = decodeURIComponent(new URL(url, 'http://lab').pathname)
  const page = path === '/' ? '/index.html' : extname(path) ? path : `${path}.html`
  const file = resolve(ROOT, `.${page}`)
  return file.startsWith(ROOT + sep) && existsSync(file) && statSync(file).isFile() ? file : undefined
}

createServer((request, response) => {
  const file = fileFor(request.url ?? '/')
  if (!file) {
    response.writeHead(404).end()
    return
  }
  response.writeHead(200, { 'content-type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(response)
}).listen(Number(process.argv[2]))
