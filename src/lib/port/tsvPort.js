//import FileCrud from './filePort.js';

export default class TsvCrud {
  constructor(settings) {
    if (typeof settings !== 'object') {
      this.data = [];
    } else {
      if (settings.content) {
        if (typeof settings.content === 'string') {
          this.data = this._unserialize(settings.content);
        }
        if (typeof settings.content === 'object') {
          this.data = settings.content;
        }
      } else {
        this.data = [];
      }

      if (
        settings.file &&
        typeof settings.file === 'object' &&
        settings.file instanceof FileCrud
      ) {
        this.file = settings.file;
      }
    }

    if (this.file && !this.file.checkExistsFile()) {
      // Create file
      this.file.create();
      this._writeFile();
    } else if (this.file) {
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
    if (this.file) {
      this._writeFile();
    }
  }

  update() {
    throw Error('Not implemented');
  }

  del() {
    throw Error('Not implemented');
  }

  _writeFile() {
    if (this.file) {
      console.info(`TSV-CRUD. Writting ${this.data.length} items`);
      const rawContents = this._serialize(this.data);
      this.file.update(rawContents);
    }
  }

  _readFile() {
    if (this.file) {
      const rawContents = this.file.read();
      const contents = this._unserialize(rawContents);
      console.info(`TSV-CRUD. Reading ${contents.length} items`);
      return contents;
    }
  }

  _serialize(contents) {
    let rawContents = '';

    // Headers
    const headers = Object.keys(contents[0]).sort();
    rawContents = headers.join('·') + '\n';

    // Body
    rawContents += contents
      .map((lineDataObj) => {
        const lineValues = headers
          .map((fieldName) => lineDataObj[fieldName])
          .join('·');
        return lineValues;
      })
      .join('\n');

    return rawContents;
  }

  _unserialize(rawContents) {
    const rawContentsArray = rawContents.split('\n');
    const contents = [];
    const headers = rawContentsArray
      .shift()
      .split('\t')
      .map((fieldName) => fieldName.trim());
    rawContentsArray.forEach((line) => {
      const lineValues = line.split('\t');
      const lineDataObj = {};
      headers.forEach((fieldName, idx) => {
        if (fieldName !== '' && lineValues[idx]) {
          lineDataObj[fieldName] = lineValues[idx].trim();
        }
      });
      contents.push(lineDataObj);
    });
    return contents;
  }
}

export const _private_ = {};

if (process.env.NODE_ENV === 'test') {
}
