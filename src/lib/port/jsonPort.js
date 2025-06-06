import fs from 'node:fs';

function checkDataPath() {
  try {
    fs.accessSync('./.data');
  } catch (err) {
    fs.mkdirSync('./.data', 0o0744);
  }

  const stats = fs.lstatSync('./.data');

  if (!stats.isDirectory()) {
    console.error('Data directory is not a real directory.');
    throw new Error('Data directory is not a real directory');
  }
}

function checkCachePath() {
  checkDataPath();

  try {
    fs.accessSync('./.data/.cache');
  } catch (err) {
    fs.mkdirSync('./.data/.cache', 0o0744);
  }

  const stats = fs.lstatSync('./.data/.cache');

  if (!stats.isDirectory()) {
    console.error('Cache directory is not a real directory.');
    throw new Error('Cache directory is not a real directory');
  }
}

function checkDir(dirname) {
  try {
    fs.accessSync(dirname);
  } catch (err) {
    return false;
  }

  const stats = fs.lstatSync(dirname);

  if (!stats.isDirectory()) {
    console.error('Cache directory is not a real directory.');
  }

  return stats.isDirectory();
}

function checkFile(filename) {
  try {
    fs.accessSync(filename);
  } catch (err) {
    return false;
  }

  const stats = fs.lstatSync(filename);

  if (!stats.isFile()) {
    console.error('JSON file is not a real file.');
  }

  return stats.isFile();
}

function writeFile(filename, contents) {
  const rawContents = JSON.stringify(contents, null, 2);
  console.log('WRITING', contents.length, 'items');
  fs.writeFileSync(filename, rawContents);
}
function readFile(filename) {
  const rawContents = fs.readFileSync(filename);
  console.log('READING');
  return JSON.parse(rawContents);
}

export default class JsonCrud {
  constructor(fileOrSettings) {
    if (typeof fileOrSettings !== 'object') {
      this.filename = fileOrSettings;
    } else {
      this.filename = fileOrSettings.filename;
    }

    if (!this.filename || typeof this.filename !== 'string') {
      throw new Error('Filename not specified');
    }
    if (!this.filename.endsWith('.json')) {
      this.filename = './.data/.cache/' + this.filename + '.json';
    }

    this.data = [];

    checkCachePath();

    if (checkFile(this.filename)) {
      // Read file
      this.data = readFile(this.filename);
    } else {
      // Create file
      writeFile(this.filename, this.data);
    }
  }
  get(condition) {
    if (!condition || typeof condition !== 'object') {
      return null;
    }
    return this.data.find((it) =>
      Object.keys(condition).every((key) => it[key] === condition[key])
    );
  }
  read(condition) {
    if (!condition || typeof condition !== 'object') {
      return this.data;
    }
    return this.data.filter((it) =>
      Object.keys(condition).every((key) => it[key] === condition[key])
    );
  }
  create() {
    throw Error('Not implemented');
  }
  update() {
    throw Error('Not implemented');
  }
  del() {
    throw Error('Not implemented');
  }
}

export const exp = {};

if (process.env.NODE_ENV === 'test') {
  exp._private_ = {
    checkDataPath,
    checkCachePath,
    checkDir,
    checkFile,
    writeFile,
    readFile,
  };
}
