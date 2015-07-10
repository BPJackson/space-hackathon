var routes = require('routes')(),
  fs = require('fs'),
  view = require('mustache'),
  mime = require('mime'),
  db = require('monk')('localhost/spaceHackathon'),
  buttons = db.get('buttons'),
  users = db.get('users'),
  qs = require('qs'),
  view = require('./view');


routes.addRoute('/', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html');
    buttons.find({}, function(err, docs) {
      if (err) res.end('whoops from index-get route');
      var template = view.render('index', {
        buttons: docs
      });
      res.end(template);
    });
  }
  if (req.method === 'POST') {
    var data = '';
    req.on('data', function(chunk) {
      data += chunk;
    });
    req.on('end', function() {
      var button = qs.parse(data);
      buttons.insert(button, function(err, doc) {
        if (err) res.end('whoops from index-post route');
        res.writeHead(302, {
          'Location': '/'
        });
        res.end();
      });
    });
  }
});

routes.addRoute('/buttons/:id/delete', (req, res, url) => {
  if (req.method === 'POST') {
    buttons.remove({
      _id: url.params.id
    }, function(err, doc) {
      if (err) console.log(err);
      res.writeHead(302, {
        'Location': '/'
      });
      res.end();
    });
  }
});

routes.addRoute('/public/*', (req, res, url) => {
  res.setHeader('Content-Type', mime.lookup(req.url));
  fs.readFile('.' + req.url, function(err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html');
      res.end('404');
    }
    res.end(file);
  });
});



module.exports = routes;