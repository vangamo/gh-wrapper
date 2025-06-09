import FileCrud from './filePort.js';

export default class JsonCrud {
  constructor(fileOrSettings) {
    if (typeof fileOrSettings !== 'object') {
      this.filename = fileOrSettings;
    } else if (fileOrSettings !== null) {
      // null is an object
      this.filename = fileOrSettings.filename;
    }

    if (!this.filename || typeof this.filename !== 'string') {
      throw new Error('Filename not specified');
    }
    if (!this.filename.endsWith('.json')) {
      this.filename = this.filename + '.json';
    }

    this.file = new FileCrud({ filename: this.filename });
    this.data = [];

    if (!this.file.checkExistsFile()) {
      // Create file
      this.file.create();
      this._writeFile();
    } else {
      // Read file
      this.data = this._readFile();
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

    if (result.length === 0) {
      return null;
    }
    if (result.length > 1) {
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

  create(item) {
    this.data.push(item);
    this._writeFile();
  }

  update(condition, item) {
    const item = this.get(condition);

    if( item === null ) {
      throw new Error('Item does not exist');
    }

    const position = this.data.findIndex((it) =>
      Object.keys(condition).every((key) => it[key] === condition[key])
    )
    
    this.data.splice(position, 1, {...item});
    this._writeFile();
  }

  del(condition) {
    const item = this.get(condition);

    if( item === null ) {
      throw new Error('Item does not exist');
    }

    const position = this.data.findIndex((it) =>
      Object.keys(condition).every((key) => it[key] === condition[key])
    )
    
    this.data.splice(position, 1);
    this._writeFile();
  }

  _writeFile() {
    console.info(`JSON-CRUD. Writting ${this.data.length} items`);
    const rawContents = this._serialize(this.data);
    this.file.update(rawContents);
  }

  _readFile() {
    const rawContents = this.file.read();
    const contents = this._unserialize(rawContents);
    console.info(`JSON-CRUD. Reading ${contents.length} items`);
    return contents;
  }

  _serialize(contents) {
    return JSON.stringify(contents, null, 2);
  }

  _unserialize(rawContents) {
    return JSON.parse(rawContents);
  }
}

export const _private_ = {};

if (process.env.NODE_ENV === 'test') {
}
