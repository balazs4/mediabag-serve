const { createServer } = require('http');
const { createReadStream } = require('fs');
const { join } = require('path');
const { check } = require('content-check');

createServer((req, res) => {
  if (req.method !== 'GET') {
    res.end();
    return;
  }
  const { url } = req;
  const file = join(process.env.FOLDER, url);
  const stream = createReadStream(file);
  const contentType = check(stream);
  res.writeHead(200, { 'Content-Type': contentType });
  stream.pipe(res);
}).listen(process.env.PORT);
