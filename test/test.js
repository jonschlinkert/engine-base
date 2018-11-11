'use strict';

require('mocha');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Engine = require('engine');
const create = require('..');
let engine;

const options = {
  interpolate: /{%=([\s\S]+?)%}/g,
  escape: /{%-([\s\S]+?)%}/g,
  evaluate: /{%([\s\S]+?)%}/g
};

describe('engine-base', () => {
  beforeEach(() => {
    engine = create(new Engine());
  });

  describe('.compileSync()', () => {
    it('should compile templates.', () => {
      let {fn} = engine.compileSync('Jon <%= name %>');
      assert.equal(typeof fn, 'function');
      assert.equal(fn({ name: 'Schlinkert' }), 'Jon Schlinkert');
    });

    it('should use custom delimiters.', () => {
      let {fn} = engine.compileSync('Jon <%= name %> {%= name %}', { ...options });
      assert.equal(typeof fn, 'function');
      assert.equal(fn({ name: 'Schlinkert' }), 'Jon <%= name %> Schlinkert');
    });
  });

  describe('.compile()', () => {
    it('should compile templates.', async() => {
      let {fn} = await engine.compile('Jon <%= name %>');
      assert.equal(typeof fn, 'function');
      assert.equal(fn({name: 'Schlinkert'}), 'Jon Schlinkert');
    });

    it('should use custom delimiters.',async () => {
      let str = 'Jon <%= name %> {%= name %}';
      let {fn} = await engine.compile(str, options);
      assert.equal(typeof fn, 'function');
      assert.equal(fn({name: 'Schlinkert'}), 'Jon <%= name %> Schlinkert');
    });
  });

  describe('.renderSync()', () => {
    it('should render templates.', () => {
      let file = engine.renderSync('Jon <%= name %>', { name: 'Schlinkert' });
      assert.equal(file.contents.toString(), 'Jon Schlinkert');
    });

    it('should use custom delimiters.', () => {
      let file = engine.renderSync('Jon <%= name %> {%= name %}', {
        name: 'Schlinkert'
      }, options);

      assert.equal(file.contents.toString(), 'Jon <%= name %> Schlinkert');
    });
  });

  describe('.render()', () => {
    it('should render templates.', async () => {
      let ctx = { name: 'Jon Schlinkert' };
      let file = await engine.render('<%= name %>', ctx);
      assert.equal(file.contents.toString(), 'Jon Schlinkert');
    });

    it('should use custom delimiters: swig.', async () => {
      let ctx = { name: 'Jon Schlinkert' };
      let file = await engine.render('{%= name %}', ctx, options);
      assert.equal(file.contents.toString(), 'Jon Schlinkert');
    });

    it('should use custom delimiters: hbs.', async () => {
      let ctx = { name: 'Jon Schlinkert' };
      let file = await engine.render('{%= name %}', ctx, options);
      assert.equal(file.contents.toString(), 'Jon Schlinkert');
    });

    it('should use helpers registered on the imports property.', async () => {
      let ctx = {
        name: 'Jon Schlinkert',
        imports: {
          include(name) {
            let filepath = path.join('test/fixtures', name);
            return fs.readFileSync(filepath, 'utf8');
          },
          upper(str) {
            return str.toUpperCase();
          }
        }
      };

      let file = await engine.render('<%= upper(include("content.tmpl")) %>', ctx);
      assert.equal(file.contents.toString(), 'JON SCHLINKERT');
    });

    it('should handle errors.', async () => {
      return engine.render('<%= name %>')
        .then(() => {
          return Promise.reject(new Error('expected an error'));
        })
        .catch(err => {
          assert.equal(err.message, 'name is not defined')
        })
    });
  });
});

