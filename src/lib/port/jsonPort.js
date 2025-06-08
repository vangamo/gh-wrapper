import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_DIRECTORY = path.join(process.cwd(), '.data');

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
    } else if( fileOrSettings !== null ) {  // null is an object
      this.filename = fileOrSettings.filename;
    }

    if (!this.filename || typeof this.filename !== 'string') {
      throw new Error('Filename not specified');
    }
    if (!this.filename.endsWith('.json')) {
      this.filename = this.filename + '.json';
    }
    if (!this.filename.includes('/')) {
      this.filename = path.join(DEFAULT_DIRECTORY, this.filename);
    }

    this.data = [];

    checkDataPath();

    if (checkFile(this.filename)) {
      // Read file
      this.data = readFile(this.filename);
    } else {
      // Create file
      writeFile(this.filename, this.data);
    }
  }
  get(condition) {
    if (!condition) {
      return null;
    }
    if (typeof condition !== 'object' || Object.keys(condition).length === 0) {
      throw new Error('Error in params');
    }

    const result = this.read(condition);
    
    if( result.length === 0 ) {
      return null;
    }
    if( result.length > 1 ) {
      throw new Error('Multiple results for get conditions');
    }

    return { ...result.at(0) };
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

export const _private_ = {};

if (process.env.NODE_ENV === 'test') {
  _private_.checkDataPath = checkDataPath;
  _private_.checkCachePath = checkCachePath;
  _private_.checkDir = checkDir;
  _private_.checkFile = checkFile;
  _private_.writeFile = writeFile;
  _private_.readFile = readFile;
}
