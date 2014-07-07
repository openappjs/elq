module.exports = {
  dist: {
    src: [
      'src/**/*.src.js'
    ],
    dest: 'dist/<%= package.name %>.js'
  },
  test: {
    src: [
      'dist/<%= package.name %>.min.js',
      'src/**/*.test.js'
    ],
    dest: 'test/test.js'
  }
};
