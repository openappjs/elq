module.exports = {
  compile: {
    name: '<%= package.name %>',
    description: '<%= package.description %>',
    version: '<%= package.version %>',
    url: '<%= package.homepage %>',
    options: {
      paths: [
        'src'
      ],
      themedir: 'node_modules/grunt-contrib-yuidoc/' +
        'node_modules/yuidocjs/themes/simple',
      outdir: 'docs/'
    }
  }
};
