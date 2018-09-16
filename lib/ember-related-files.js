'use babel';

import { CompositeDisposable } from 'atom';
import EmberRelatedFilesView from './ember-related-files-view';
import { emiter } from './helpers/emiterService';

const path = require('path');
const fs = require('fs');

const OPTIONAL_SCHEMA = ['matchNumber'];
const CONFIG_SCHEMA = ['search', 'test'];
const REGEX_SCHEMA = ['search', 'searchDir', 'test']; // properise which need to be regex

export default {
  emberRelatedFilesView: null,
  modalPanel: null,
  subscriptions: null,

  pathToConfig: null,
  rootDirectory: null,

  searchResults: [],

  activate(state) {
    this.config = atom.config.get('ember-related-files');
    this.rootDirectory = atom.project.getPaths()[0];

    this.emberRelatedFilesView = new EmberRelatedFilesView(state.emberRelatedFilesViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.emberRelatedFilesView.getElement(),
      visible: false,
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'ember-related-files:toggle': () => this.toggle(),
      }),
    );
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.emberRelatedFilesView.destroy();
  },

  serialize() {
    return {
      emberRelatedFilesViewState: this.emberRelatedFilesView.serialize(),
    };
  },

  getConfigFile() {
    const filePath = path.resolve(this.rootDirectory, this.config.pathToRegexs);

    return new Promise((res, rej) => {
      fs.readFile(filePath, 'utf8', (err, configData) => {
        if (err) {
          rej(err);
        }

        try {
          const parsedData = JSON.parse(configData);
          res(parsedData);
        } catch (error) {
          rej(error);
        }
      });
    });
  },

  async toggle() {
    this.searchResults = [];

    const config = await this.getConfigFile();
    const rootDirectory = this.rootDirectory;

    const parsedConfig = this.parseConfig(config);
    if (!parsedConfig) {
      return null;
    }

    const configArray = this.mapConfigToArray(parsedConfig);

    const currentFileAbsolutePath = atom.workspace.getActivePaneItem().buffer.file.path;
    const testsResults = this.runTests(configArray, currentFileAbsolutePath);

    testsResults.forEach((searchEntry) => {
      const dirToSearch = path.join(rootDirectory, searchEntry.searchDir);

      this.parsePath(dirToSearch, (data) => {
        const files = data.filter(dir => dir.isFile);

        files.forEach((file) => {
          const fileMatch = searchEntry.search.test(file.name);
          if (fileMatch) {
            this.searchResults.push(file);
          }
        });

        emiter.emit('did-search-finish', this.searchResults);
      });
    });

    // clear items from list when file did not pass test
    if (testsResults.length === 0) {
      emiter.emit('did-search-finish', this.searchResults);
    }

    return (
      this.modalPanel.isVisible() ?
        this.modalPanel.hide() :
        this.modalPanel.show()
    );
  },

  runTests(configArray, filePath) {
    return configArray.filter(config => config.test.test(filePath));
  },

  mapConfigToArray(config) {
    return Object.values(config);
  },

  parsePath(pathToCrawl, cb) {
    fs.readdir(pathToCrawl, (err, data) => {
      if (err) throw err;

      const resolvedPath = data.map(dir => new Promise((res, rej) => {
        const pathToCheck = path.join(pathToCrawl, dir);

        fs.lstat(pathToCheck, (error, stats) => {
          if (error) rej(error);

          res({
            name: dir,
            path: pathToCheck,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
          });
        });
      }));

      Promise.all(resolvedPath).then((parseResult) => {
        cb(parseResult);

        const directories = parseResult.filter(dir => dir.isDirectory);
        directories.forEach((directory) => {
          this.parsePath(directory.path, cb);
        });
      })
    });
  },

  parseConfig(config) {
    if (!config) {
      atom.notifications.addWarning('Missing config');
      return false;
    }

    const mainKeys = Object.keys(config);
    const mainKeyslength = mainKeys.length;

    let isSchemaOk = true;

    for (let j = 0; j < mainKeyslength; j++) {
      const testObject = config[mainKeys[j]];
      const propertyKeys = Object.keys(testObject);
      const propertyLength = propertyKeys.length;
      testObject.label = mainKeys[j];

      for (let i = 0; i < propertyLength; i++) {
        CONFIG_SCHEMA.forEach((key) => { // eslint-disable-line no-loop-func
          if (!testObject[key]) {
            isSchemaOk = false;
            atom.notifications.addWarning(
              `Wrong config field for: ${mainKeys[j]} -> ${propertyKeys[i]} -> ${key}`,
            );
          } else {
            const schouldChangeToRegex = REGEX_SCHEMA.indexOf(key);
            if (schouldChangeToRegex >= 0) {
              testObject[key] = new RegExp(testObject[key]);
            }
          }
        });
      }
    }

    return isSchemaOk ? config : null;
  },

  config: {
    pathToRegexs: {
      type: 'string',
      default: './regex',
    },
  },
};
