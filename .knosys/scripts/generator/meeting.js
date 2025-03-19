const { dump } = require('js-yaml');

const { sortByDate, generateIdFromDate, resolvePathFromParams, readReadMe, ensureDirExists, saveData } = require('../helper');
const { getCollectionRoot, createGenerator } = require('./helper');

const collectionName = 'meetings';
const paramPath = 'year/month/daytime';

function resolveItemData(sourceRootPath, _, item, params, cache) {
  const id = generateIdFromDate(item.date);
  const content = readReadMe(`${sourceRootPath}/${collectionName}/${resolvePathFromParams(paramPath, params)}`)
    .replace(/(?:\<img (?:.+)?)src=\"([^\"]+)\"/g, (match, srcPath) => match.replace(srcPath, `/knosys/${collectionName}/${id}/${srcPath}`))
    .replace(/!\[([^\[\]]+)?\]\(([^\(\)]+)\)/g, (match, _, srcPath) => match.replace(srcPath, `/knosys/${collectionName}/${id}/${srcPath}`));
  const meeting = { id, ...item };

  cache.content = content;

  return meeting;
}

function generateMarkdown(slug, item, _, cache) {
  if (!item) {
    return;
  }

  const { id } = item;
  const itemDirPath = `${getCollectionRoot(collectionName)}/${id}`;
  const data = Object.keys(item)
    .filter(key => ['title', 'date', 'tags', 'categories'].includes(key) && item[key])
    .reduce((acc, key) => ({ ...acc, [key]: item[key] }), {});

  data.permalink = `/${collectionName}/${id}/`;

  ensureDirExists(itemDirPath);
  saveData(`${itemDirPath}/index.md`, `---\n${dump(data)}---\n\n${cache.content}\n`);
}

module.exports = {
  createMeetingGenerator: sourceRootPath => createGenerator(sourceRootPath, collectionName, {
    paramPath,
    getItemSlug: (_, item) => generateIdFromDate(item.date),
    getImagePath: (_, imageFileName, item) => `/knosys/${collectionName}/${generateIdFromDate(item.date)}/${imageFileName}`,
    getItemImageDir: (item, _, { imageDir }) => `${imageDir}/${generateIdFromDate(item.date)}`,
    transformItem: resolveItemData.bind(null, sourceRootPath),
    transformData: items => ({ items, sequence: sortByDate(Object.keys(items).map(key => items[key])).map(({ id }) => id) }),
    readEach: generateMarkdown,
  }),
};
