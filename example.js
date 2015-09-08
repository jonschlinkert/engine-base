var engine = require('./');
var pkg = require('./package');

var fn = engine.compileSync('<%= name %>');
console.log(fn(pkg));

engine.compile('<%= name %>', function (err, fn) {
  if (err) return console.log(err);
  console.log(fn(pkg));
});

engine.render('<%= name %>', pkg, function (err, str) {
  if (err) return console.log(err);
  console.log(str);
});

var str = engine.renderSync('<%= name %>', pkg);
console.log(str);
