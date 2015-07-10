var http = require('http');
var url = require('url');
var router = require('./router');

var server = http.createServer (function (req, res) {
  if (req.url === '/favicon.ico'){
    res.writeHead (200, {'Content-Type': 'image/x-icon'});
    res.end();
    return;
  }
  var path = url.parse (req.url).pathname;
  var currentRoute = router.match(path);
  currentRoute.fn(req, res, currentRoute);
});

server.listen(7890, function (err) {
  if (err) console.log('shit is broken');
  console.log('Shit is tight on 7890');
});
