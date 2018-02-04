const { createServer } = require('http');
const { createReadStream, statSync } = require('fs');
const { join } = require('path');
const { check } = require('content-check');
const readdir = require('recursive-readdir');

createServer(async (req, res) => {
  const { url = '/', method, headers: { range } } = req;
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
  if (range) {
    console.log('streaming...');
    const total = statSync(file).size;
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
    const stream = createReadStream(file, { start, end });
    res.writeHead(206, {
      'Content-Type': check(stream),
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1
    });
    stream.pipe(res);
    return;
  } else {
    const stream = createReadStream(file);
    res.writeHead(200, { 'Content-Type': check(stream) });
    stream.pipe(res);
    return;
  }
}).listen(process.env.PORT);
