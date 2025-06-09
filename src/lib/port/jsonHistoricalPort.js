import JsonCrud from './jsonPort.js';

export default class JsonHistoricalCrud extends JsonCrud {
  constructor(fileOrSettings) {
    super(fileOrSettings);

    const historicalFilename = this.filename.replace('.json', '_historical.json');

    this.historicalCrud = new JsonCrud(historicalFilename);
  }
  /*
  get(condition) { }

  read(condition) { }
  */
  create(item) {
    const now = (new Date()).getTime() ;
    item._createdAt = now;
    super.create(item);
  }

  update(condition, item) {
    const itemFound = this.get(condition);
    if( itemFound === null ) {
      throw new Error('Item does not exist');
    }

    const now = (new Date()).getTime() ;
    const itemForHistoricalList = {...itemFound, _updateddAt: now};
    this.historicalCrud.create(itemForHistoricalList);

    item._createdAt = itemFound._createdAt;
    item._updateddAt = now;
    super.update(condition, item);
  }

  del(condition) {
    const itemFound = this.get(condition);
    if( itemFound === null ) {
      throw new Error('Item does not exist');
    }

    const now = (new Date()).getTime() ;
    const itemForHistoricalList = {...itemFound, _deletedAt: now};
    this.historicalCrud.create(itemForHistoricalList);

    super.del(condition);
  }
  /*
  _writeFile() { }

  _readFile() { }

  _serialize(contents) { }

  _unserialize(rawContents) { }
  */
}

export const _private_ = {};

if (process.env.NODE_ENV === 'test') {
}
