const { createServer } = require('http');
const { createReadStream } = require('fs');
const { join } = require('path');
const { check } = require('content-check');
const readdir = require('recursive-readdir');

createServer(async (req, res) => {
  const { url = '/', method } = req;
  if (method !== 'GET') {
    res.end();
    return;
  }

  if (url === '/') {
    const fullpaths = await readdir(process.env.FOLDER);
    const files = fullpaths.map(x => x.replace(process.env.FOLDER, ''));
    res.writeHead(200, { 'Content-Type': check(files) });
    res.write(JSON.stringify(files));
    res.end();
    return;
  }

  const file = join(process.env.FOLDER, url);
  const stream = createReadStream(file);
  res.writeHead(200, { 'Content-Type': check(stream) });
  stream.pipe(res);
}).listen(process.env.PORT);
