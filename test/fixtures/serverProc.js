var http = require('http');

var app = http.createServer(function (req, res) {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.write(process.env.NODE_ENV || 'development');
  res.end();
});

if (!process.env.PORT)
  process.exit(1);

app.listen(process.env.PORT);
console.log(process.env.PORT);
