const { resolve: resolvePath } = require('path');

const { resolveRootPath, ensureDirExists, getLocalDataRoot, getLocalDocRoot } = require('../helper');
const { createMeetingGenerator } = require('../generator');

module.exports = {
  execute: () => {
    [getLocalDataRoot(), getLocalDocRoot()].forEach(distPath => ensureDirExists(distPath, true));

    const sourceRootPath = resolvePath(resolveRootPath(), 'data');

    const generators = {
      meeting: createMeetingGenerator(sourceRootPath),
    };

    Object.values(generators).forEach(generator => generator());
  },
};
