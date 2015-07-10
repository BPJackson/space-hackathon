var mustache = require('mustache');
var fs = require('fs');


var view = {
  render: function(path, data) {
    var file = fs.readFileSync('space/' + path + '.html');
    return mustache.render(file.toString(), data);
  }
};

module.exports = view;