module.exports = {
  options: {
    files: ['package.json'],
    updateConfigs: [],
    commit: false,
    createTag: true,
    tagName: 'v%VERSION%',
    tagMessage: 'Version %VERSION%',
    push: false
  }
};
