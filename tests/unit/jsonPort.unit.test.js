import fs from 'node:fs';
import JsonCrud from '../../src/lib/port/jsonPort';


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
