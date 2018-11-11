'use strict';

module.exports = instance => {
  if (instance === void 0) throw new Error('expected an instance of "engine"');

  const engine = {
    name: 'base',
    instance,
    async compile(file, options) {
      if (typeof file === 'string') file = { contents: file };
      let opts = { ...options };
      opts.imports = Object.assign({}, this.helpers, opts.helpers, opts.imports);
      if (typeof file.fn !== 'function' || opts.recompile === true) {
        file.fn = instance.compile(file.contents.toString(), opts);
      }
      return file;
    },
    async render(file, locals, options) {
      if (typeof file === 'string') file = { contents: file };

      if (typeof file.fn !== 'function') {
        await engine.compile.call(this, file, { ...locals, ...options });
      }

      let res = await file.fn(locals);
      let str = this.resolveIds ? await this.resolveIds(res) : res;
      file.contents = Buffer.from(str);
      return file;
    },
    compileSync(file, options) {
      if (typeof file === 'string') file = { contents: file };
      let opts = { ...options };
      opts.imports = Object.assign({}, this.helpers, opts.helpers, opts.imports);
      if (typeof file.fn !== 'function' || opts.recompile === true) {
        file.fn = instance.compile(file.contents.toString(), opts);
      }
      return file;
    },
    renderSync(file, locals, options) {
      if (typeof file === 'string') file = { contents: file };
      if (typeof file.fn !== 'function') {
        engine.compileSync.call(this, file, { ...locals, ...options });
      }
      file.contents = Buffer.from(file.fn(locals));
      return file;
    }
  };

  return engine;
};
