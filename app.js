require('dotenv').load()

var http = require('http');
var url = require('url');
var router = require('./router');
var NodeSession = require('node-session');
var session = new NodeSession({secret: process.env.SECRET});


var server = http.createServer (function (req, res) {
  if (req.url === '/favicon.ico'){
    res.writeHead (200, {'Content-Type': 'image/x-icon'});
    res.end();
    return;
  }
  var path = url.parse (req.url).pathname;
  var currentRoute = router.match(path);
  if (currentRoute) {
    session.startSession(req, res, function() {
    currentRoute.fn(req, res, currentRoute);
  })}
  else {
    res.end('404')
  }
});

server.listen(7890, function (err) {
  if (err) console.log('shit is broken');
  console.log('Spun and run on 7890');
});
