module.exports = {
  options: {
    sourceMap: 'dist/<%= package.name %>.min.map',
    sourceMappingURL: '<%= package.name %>.min.map',
    sourceMapPrefix: 1,
    preserveComments: 'some'
  },
  dist: {
    src: 'dist/<%= package.name %>.js',
    dest: 'dist/<%= package.name %>.min.js'
  }
};
