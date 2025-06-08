import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_DIRECTORY =
  process.env.NODE_ENV === 'test' ? '.test' : path.join(process.cwd(), '.data');

export default class FileCrud {
  constructor(options) {
    if (!options.filename) {
      throw new Error('Filename expected');
    }
    this.filename = path.basename(options.filename);
    this.path = path.dirname(options.filename);

    if (this.path === '.') {
      this.path = DEFAULT_DIRECTORY;
    }
  }

  get() {
    throw Error('Not implemented');
  }

  read() {
    return fs.readFileSync(path.join(this.path, this.filename));
  }

  create() {
    if (!this.checkExistsDir()) {
      console.info('FILE-CRUD. Creating', this.path);
      fs.mkdirSync(this.path, 0o0744);
    }
    console.info('FILE-CRUD. Creating', this.filename);
    this.update('');
  }

  update(rawContents) {
    fs.writeFileSync(path.join(this.path, this.filename), rawContents);
  }

  del() {
    throw Error('Not implemented');
  }

  checkExistsDir() {
    try {
      fs.accessSync(this.path);
    } catch (err) {
      return false;
      //fs.mkdirSync(this.path, 0o0744);
      // @todo Add an option
    }

    const stats = fs.lstatSync(this.path);
    if (!stats.isDirectory()) {
      console.error('FILE-CRUD. ERROR Data directory is not a real directory.');
      throw new Error('Data directory is not a real directory');
    }
    return true;
  }

  checkExistsFile() {
    if (!this.checkExistsDir()) {
      return false;
    }
    try {
      fs.accessSync(path.join(this.path, this.filename));      
    } catch (err) {
      return false;
    }

    const stats = fs.lstatSync(path.join(this.path, this.filename));
    
    if (!stats.isFile()) {
      console.error(`FILE-CRUD. ERROR ${this.filename} is not a real file.`);
    }

    return stats.isFile();
  }
}

export const _private_ = {};

if (process.env.NODE_ENV === 'test') {
}
