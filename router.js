require('dotenv').load();
var routes = require('routes')(),
  fs = require('fs'),
  view = require('mustache'),
  mime = require('mime'),
  db = require('monk')(process.env.MONGOLAB_URI),
  buttons = db.get('button'),
  newsearch = db.get('newsearch'),
  users = db.get('users'),
  qs = require('qs'),
  view = require('./view');



routes.addRoute('/homepage', (req, res, url) => {
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
          'Location': '/homepage'
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
        'Location': '/homepage'
      });
      res.end();
    });
  }
});
routes.addRoute('/register', (req, res, url) => {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    var template = view.render('sessions/register',  {title: 'Log In'})
    res.end(template)
  }
  if (req.method === 'POST') {
    var data = ''

    req.on('data', function (chunk) {
      data += chunk
    })

    req.on('end', function () {
      console.log('we are going to insert a user into the db!')
      var user = qs.parse(data)
      users.insert(user, function(err, doc) {
        if (err) {
          res.writeHead(302, {'Location': '/register'})
          res.end()
          return
        }
        req.session.put('email', doc.email)
        res.writeHead(302, {'Location': '/homepage'})
        res.end()
      })
    })
  }
})

routes.addRoute('/', (req, res, url) => {
  if (req.method === 'GET') {
    var template = view.render('sessions/login', {})
    res.end(template)
  }
  if (req.method === 'POST') {
    var data = ''

    req.on('data', function (chunk) {
      data += chunk
    })
    req.on('end', function () {
      var user = qs.parse(data)
      console.log(user)
      users.findOne({email: user.email}, function(err, doc) {
        if (err) {
          res.writeHead(302, {'Location': '/register'})
          res.end()
        }
        if (doc && user.password === doc.password) {
        req.session.put('email', doc.email)
        res.writeHead(302, {'Location': '/homepage'})
        res.end()
        }
        else {
          console.log('passwords didnt match')
          res.writeHead(302, {'Location':'/'})
          res.end()
        }
  })
})
}})
routes.addRoute('/logout', (req, res, url) => {
  req.session.flush()
  res.writeHead(302, {'Location': '/'})
  res.end()

})


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
