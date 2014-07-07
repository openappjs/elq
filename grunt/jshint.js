module.exports = {
  options: {
    // pretty console output
    reporter: require('jshint-stylish'),
    // allow assignment inside conditionals
    boss: true,
    // don't use underscores in identifiers
    camelcase: true,
    // require curlies even for single-statement blocks
    curly: true,
    // require ===
    eqeqeq: true,
    // allow `== null` for null/undefined check
    eqnull: true,
    // no var statements inside blocks
    funcscope: true,
    // 2-space indentation
    indent: 2,
    // don't require semis in single-line functions
    lastsemic: true,
    // max of 80 chars per line
    maxlen: 80,
    // single quotes
    quotmark: 'single',
    // no trailing spaces
    trailing: true,
    // allow assignment expressions inside ternary ops
    '-W030': true
  },
  grunt: {
    files: {
      src: ['grunt/**/*.js']
    },
    options: {
      // allow Node.js globals
      node: true
    }
  },
  gruntfile: {
    files: {
      src: ['Gruntfile.js']
    },
    options: {
      // allow Node.js globals
      node: true,
      // don't allow use of undefined vars
      undef: true
    }
  },
  test: {
    files: {
      src: ['src/**/*.test.js']
    },
    options: {
      // allow browser globals
      browser: true,
      // don't allow use of undefined vars
      undef: true,
      // more allowed globals
      globals: {
        console: true,
        describe: true,
        it: true,
        expect: true,
        assert: true,
        elq: true,
      }
    }
  },
  src: {
    files: {
      src: ['src/**/*.src.js']
    },
    options: {
      // max of 78 chars per line
      maxlen: 78
    }
  },
  dist: {
    files: {
      src: ['dist/<%= package.name %>.js']
    },
    options: {
      // allow browser globals
      browser: true,
      // don't allow use of undefined vars
      undef: true,
      // don't allow unused vars
      unused: 'vars',
      // allow function hoisting
      '-W003': true,
      // use of `this` in strict mode on functions that aren't methods
      '-W040': true
    }
  }
};
