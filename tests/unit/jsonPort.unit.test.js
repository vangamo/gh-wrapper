import { jest } from '@jest/globals'; // <https://jestjs.io/docs/ecmascript-modules>
import fs from 'node:fs';
import JsonCrud, { _private_ } from '../../src/lib/port/jsonPort';

jest.mock('node:fs', () => jest.fn());

describe('Json CRUD test unit normal cases', () => {
  describe('Private methods', () => {
    it('library has private methods', async () => {
      expect(typeof _private_).toBe('object');
    });
  });

  describe('Class constructor', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('creates an instance when the parameter is a string with path and .json extension', () => {
      const instance = new JsonCrud('.data/.cache/test.json');
      expect(typeof instance).toBe('object');
      expect(instance instanceof JsonCrud).toBe(true);
      expect(instance.filename).toBe('.data/.cache/test.json');
    });

    it('creates an instance when the parameter is an object with path and .json extension', () => {
      const instance = new JsonCrud({filename: '.data/.cache/test.json'});
      expect(typeof instance).toBe('object');
      expect(instance instanceof JsonCrud).toBe(true);
      expect(instance.filename).toBe('.data/.cache/test.json');
    });
/*
    it('creates an instance when the parameter is a string with path but without .json extension', () => {
      fs.mkdirSync = jest.fn(() => {});
      fs.writeFileSync = jest.fn(() => {});
      const instance = new JsonCrud('.data/.cache/test');
      expect(instance.filename).toBe('.data/.cache/test.json');
    });

    it('creates an instance when the parameter is a string with .json extension but without path', () => {
      fs.mkdirSync = jest.fn(() => {});
      fs.writeFileSync = jest.fn(() => {});
      const instance = new JsonCrud('test.json');
      expect(instance.filename).toBe('.data/.cache/test.json');
    });

    it('creates the file when filename does not exist', () => {
      fs.accessSync = jest.fn(() => {
        throw new Error('File does not exist');
      });
      fs.mkdirSync = jest.fn(() => {});
      fs.writeFileSync = jest.fn(() => {});
      new JsonCrud('filename-does-not-matter-in-this-test');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
*/
    it('reads the file when filename exists', () => {
      fs.lstatSync = jest.fn(() => ({
        isDirectory: () => true,
        isFile: () => true,
      }));
      fs.readFileSync = jest.fn(() => '[]');
      new JsonCrud('filename-does-not-matter-in-this-test');
      expect(fs.readFileSync).toHaveBeenCalled();
    });

  });

  describe('get method', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const mockup_lstatSync = jest.fn(() => ({
        isDirectory: () => true,
        isFile: () => true,
      }));
    const mockup_readFileSync = jest.fn(() => '[{"ID":1,"NAME":"TEST-OBJECT-1","TAG":"A"},{"ID":2,"NAME":"TEST-OBJECT-2","TAG":"A"},{"ID":3,"NAME":"TEST-OBJECT-3","TAG":"B"}]');
    const mockupNoData_readFileSync = jest.fn(() => '[]');

    it('returns null when parameter is null', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;

      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result = instance.get(null);
      expect(result).toBe(null);
    });
    
    it('returns an object when parameter has one property', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;

      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result = instance.get({ID: 1});
      expect(typeof result).toBe('object');
      expect(result).toEqual({ID: 1, NAME: 'TEST-OBJECT-1', TAG: 'A'});
    });

    it('returns an object when parameter has multiple properties', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;

      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result = instance.get({ID: 1, TAG: 'A'});
      expect(typeof result).toBe('object');
      expect(result).toEqual({ID: 1, NAME: 'TEST-OBJECT-1', TAG: 'A'});
    });

    it('returns null when parameter has one property but no data', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockupNoData_readFileSync;

      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result = instance.get({ID: 1});
      expect(result).toBe(null);
    });

    it('returns null when parameter has one property but does not exist', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;

      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result = instance.get({ID: 42});
      expect(result).toBe(null);
    });
  });

  describe('read method', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const mockup_lstatSync = jest.fn(() => ({
        isDirectory: () => true,
        isFile: () => true,
      }));
    const mockup_readFileSync = jest.fn(() => '[{"ID":1,"NAME":"TEST-OBJECT-1","TAG":"A"},{"ID":2,"NAME":"TEST-OBJECT-2","TAG":"A"},{"ID":3,"NAME":"TEST-OBJECT-3","TAG":"B"}]');

    it('returns complete array when no parameter', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;

      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result = instance.read();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
    });

    it('returns filtered array when parameter has one property', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;

      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result1 = instance.read({ID: 1});
      expect(Array.isArray(result1)).toBe(true);
      expect(result1.length).toBe(1);

      const result2 = instance.read({TAG: 'A'});
      expect(Array.isArray(result2)).toBe(true);
      expect(result2.length).toBe(2);
    });

    it('returns filtered array when parameter has multiple properties', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;

      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result = instance.read({ID: 1, TAG: 'A'});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('returns an empty array when parameter has one property but no data match', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;

      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result = instance.read({ID: 42});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });
});

describe('Json CRUD test unit error cases', () => {
  describe('Class constructor', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('validates null parameter', () => {
      const f = () => new JsonCrud(null);

      expect(f).toThrow(Error);
      expect(f).toThrow('Filename not specified');
    });

    it('validates empty parameter', () => {
      const f = () => { new JsonCrud() };

      expect(f).toThrow(Error);
      expect(f).toThrow('Filename not specified');
    });

    it('validates parameter is a number', () => {
      const f = () => { new JsonCrud(42) };

      expect(f).toThrow(Error);
      expect(f).toThrow('Filename not specified');
    });

    it('validates parameter is an array', () => {
      const f = () => { new JsonCrud( [] ) };

      expect(f).toThrow(Error);
      expect(f).toThrow('Filename not specified');
    });

    it('validates parameter is an empty string', () => {
      const f = () => { new JsonCrud('') };

      expect(f).toThrow(Error);
      expect(f).toThrow('Filename not specified');
    });

    it('validates object parameter without filename property', () => {
      const f = () => { new JsonCrud( {otherParam: ''} ) };

      expect(f).toThrow(Error);
      expect(f).toThrow('Filename not specified');
    });
    it('validates object parameter with an empty filename property', () => {
      const f = () => { new JsonCrud( {filename: ''} ) };

      expect(f).toThrow(Error);
      expect(f).toThrow('Filename not specified');
    });
  });

  describe('get method', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const mockup_lstatSync = jest.fn(() => ({
        isDirectory: () => true,
        isFile: () => true,
      }));
    const mockup_readFileSync = jest.fn(() => '[{"ID":1,"NAME":"TEST-OBJECT-1","TAG":"A"},{"ID":2,"NAME":"TEST-OBJECT-2","TAG":"A"},{"ID":3,"NAME":"TEST-OBJECT-3","TAG":"B"}]');

    it('validates number parameter', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;
      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const f = () => instance.get(42);

      expect(f).toThrow(Error);
      expect(f).toThrow('Error in params');
    });

    it('validates empty object parameter', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;
      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const f = () => instance.get({});

      expect(f).toThrow(Error);
      expect(f).toThrow('Error in params');
    });

    it('validates condition with more than one result', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;
      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const f = () => instance.get( {ID: 1, TAG: 'A'} );

      expect(f).toThrow(Error);
      expect(f).toThrow('Multiple results for get conditions');
    });
  });

  describe('read method', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const mockup_lstatSync = jest.fn(() => ({
        isDirectory: () => true,
        isFile: () => true,
      }));
    const mockup_readFileSync = jest.fn(() => '[{"ID":1,"NAME":"TEST-OBJECT-1","TAG":"A"},{"ID":2,"NAME":"TEST-OBJECT-2","TAG":"A"},{"ID":3,"NAME":"TEST-OBJECT-3","TAG":"B"}]');

    it('returns complete array with numeric parameter', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;
      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result = instance.read(42);

      expect(Array.isArray(result)).toBe( true );
      expect(result.length).toBe(3);
    });

    it('returns complete array with empty object parameter', () => {
      fs.lstatSync = mockup_lstatSync;
      fs.readFileSync = mockup_readFileSync;
      const instance = new JsonCrud('filename-does-not-matter-in-this-test');
      const result = instance.read({});

      expect(Array.isArray(result)).toBe( true );
      expect(result.length).toBe(3);
    });
  });
});



/*
jest.mock('node:fs');

describe('JsonCrud', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDataPath', () => {
    it('should create .data directory if it does not exist', () => {
      fs.accessSync.mockImplementation(() => {
        throw new Error('Directory does not exist');
      });
      JsonCrud._private_.checkDataPath();
      expect(fs.mkdirSync).toHaveBeenCalledWith('./.data', 0o0744);
    });

    it('should throw an error if .data is not a directory', () => {
      fs.lstatSync.mockReturnValue({ isDirectory: () => false });
      expect(() => JsonCrud._private_.checkDataPath()).toThrow('Data directory is not a real directory');
    });
  });

  describe('checkCachePath', () => {
    it('should create .cache directory if it does not exist', () => {
      fs.accessSync.mockImplementation(() => {
        throw new Error('Directory does not exist');
      });
      JsonCrud._private_.checkCachePath();
      expect(fs.mkdirSync).toHaveBeenCalledWith('./.data/.cache', 0o0744);
    });

    it('should throw an error if .cache is not a directory', () => {
      fs.lstatSync.mockReturnValue({ isDirectory: () => false });
      expect(() => JsonCrud._private_.checkCachePath()).toThrow('Cache directory is not a real directory');
    });
  });

  describe('checkDir', () => {
    it('should return false if directory does not exist', () => {
      fs.accessSync.mockImplementation(() => {
        throw new Error('Directory does not exist');
      });
      expect(JsonCrud._private_.checkDir('./someDir')).toBe(false);
    });

    it('should return true if directory exists and is a directory', () => {
      fs.lstatSync.mockReturnValue({ isDirectory: () => true });
      expect(JsonCrud._private_.checkDir('./someDir')).toBe(true);
    });
  });

  describe('checkFile', () => {
    it('should return false if file does not exist', () => {
      fs.accessSync.mockImplementation(() => {
        throw new Error('File does not exist');
      });
      expect(JsonCrud._private_.checkFile('./someFile')).toBe(false);
    });

    it('should return true if file exists and is a file', () => {
      fs.lstatSync.mockReturnValue({ isFile: () => true });
      expect(JsonCrud._private_.checkFile('./someFile')).toBe(true);
    });
  });

  describe('JsonCrud class', () => {
    it('should throw an error if filename is not specified', () => {
      expect(() => new JsonCrud()).toThrow('Filename not specified');
    });

    it('should throw an error if filename is not a string', () => {
      expect(() => new JsonCrud(123)).toThrow('Filename not specified');
    });

    it('should append .json to filename if it does not end with .json', () => {
      const jsonCrud = new JsonCrud('test');
      expect(jsonCrud.filename).toBe('./.data/.cache/test.json');
    });

    it('should read file if it exists', () => {
      fs.lstatSync.mockReturnValue({ isFile: () => true });
      const jsonCrud = new JsonCrud('test.json');
      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should create file if it does not exist', () => {
      fs.accessSync.mockImplementation(() => {
        throw new Error('File does not exist');
      });
      new JsonCrud('test.json');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });
});
*/
