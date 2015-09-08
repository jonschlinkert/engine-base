'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var engine = require('..');
require('mocha');


describe('.compileSync()', function () {
  it('should compile templates.', function () {
    var fn = engine.compileSync('Jon <%= name %>');
    assert(typeof fn === 'function');
    assert(fn({name: 'Schlinkert'}) === 'Jon Schlinkert');
  });

  it('should use custom delimiters.', function () {
    var fn = engine.compileSync('Jon <%= name %> {%= name %}', {
      delims: ['{%', '%}']
    });
    assert(typeof fn === 'function');
    assert(fn({name: 'Schlinkert'}) === 'Jon <%= name %> Schlinkert');
  });

  it('should emit an error event when conflicting data is found.', function () {
    var ctx = {
      name: 'Jon Schlinkert',
      foo: 'bar',
      imports: {
        foo: function () {}
      }
    };
    ctx.debugEngine = true;
    engine.on('error', function (err) {
      assert(err.id === 'helper-conflict');
    });
    engine.compileSync('<%= name %>', ctx);
  });
});

describe('.compile()', function () {
  it('should compile templates.', function (done) {
    engine.compile('Jon <%= name %>', function (err, fn) {
      if (err) return done(err);
      assert(typeof fn === 'function');
      assert(fn({
        name: 'Schlinkert'
      }) === 'Jon Schlinkert');
      done();
    });
  });

  it('should use custom delimiters.', function (done) {
    var settings = {
      delims: ['{%', '%}']
    };
    var str = 'Jon <%= name %> {%= name %}';
    engine.compile(str, settings, function (err, fn) {
      if (err) return done(err);
      assert(typeof fn === 'function');
      assert(fn({
        name: 'Schlinkert'
      }) === 'Jon <%= name %> Schlinkert');
      done();
    });
  });
});

describe('.renderSync()', function () {
  it('should render templates.', function () {
    var str = engine.renderSync('Jon <%= name %>', {
      name: 'Schlinkert'
    });
    assert(str === 'Jon Schlinkert');
  });

  it('should use custom delimiters.', function () {
    var str = engine.renderSync('Jon <%= name %> {%= name %}', {
      delims: ['{%', '%}'],
      name: 'Schlinkert'
    });
    assert(str === 'Jon <%= name %> Schlinkert');
  });
});

describe('.render()', function () {
  it('should render templates.', function (done) {
    var ctx = {name: 'Jon Schlinkert'};

    engine.render('<%= name %>', ctx, function (err, content) {
      assert(content === 'Jon Schlinkert');
      done();
    });
  });

  it('should use custom delimiters: swig.', function (done) {
    var ctx = {name: 'Jon Schlinkert', delims: ['{%', '%}']};

    engine.render('{%= name %}', ctx, function (err, content) {
      assert(content === 'Jon Schlinkert');
      done();
    });
  });

  it('should use custom delimiters: hbs.', function (done) {
    var ctx = {name: 'Jon Schlinkert', delims: ['{{', '}}']};

    engine.render('{{= name }}', ctx, function (err, content) {
      assert(content === 'Jon Schlinkert');
      done();
    });
  });

  it('should use helpers registered on the imports property.', function (done) {
    var ctx = {
      name: 'Jon Schlinkert',
      imports: {
        include: function (name) {
          var filepath = path.join('test/fixtures', name);
          return fs.readFileSync(filepath, 'utf8');
        },
        upper: function (str) {
          return str.toUpperCase();
        }
      }
    };

    engine.render('<%= upper(include("content.tmpl")) %>', ctx, function (err, content) {
      assert(content === 'JON SCHLINKERT');
      done();
    });
  });

  it('should emit an error when conflicting data is found.', function (done) {
    var ctx = {
      name: 'Jon Schlinkert',
      foo: 'bar',
      imports: {
        foo: function () {}
      }
    };
    ctx.debugEngine = true;
    engine.on('error', function (err) {
      assert(err.id === 'helper-conflict');
      done();
    });
    engine.render('<%= name %>', ctx, function (err, content) {
      assert(content === 'Jon Schlinkert');
    });
  });

  it('should handle errors.', function (done) {
    engine.render('<%= name %>', function (err, content) {
      assert(err.message === 'name is not defined');
      done();
    });
  });
});

describe('.renderFile()', function () {
  it('should render templates from a file.', function (done) {
    var ctx = {
      name: 'Jon Schlinkert'
    };

    engine.renderFile('test/fixtures/default.tmpl', ctx, function (err, content) {
      assert(content === 'Jon Schlinkert');
      done();
    });
  });

  it('should work when no context is passed.', function (done) {
    engine.renderFile('test/fixtures/nothing.tmpl', function (err, content) {
      assert(content === 'empty');
      done();
    });
  });

  it('should handle errors.', function (done) {
    engine.renderFile('test/fixtures/default.tmpl', function (err, content) {
      assert(err.message === 'name is not defined');
      done();
    });
  });
});
