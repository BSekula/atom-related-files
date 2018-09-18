'use babel';

import { CompositeDisposable } from 'atom';
import EmberRelatedFilesView from './atom-related-files-view';
import { emiter } from './helpers/emiterService';

const path = require('path');
const fs = require('fs');

const OPTIONAL_SCHEMA = ['matchNumber'];
const CONFIG_SCHEMA = ['search', 'test', 'searchDir'];
const REGEX_SCHEMA = ['test']; // properise which need to be regex
// 'search' - is changed to regex after swappings data fropm test e.g. test/(1)/*.js

export default {
  emberRelatedFilesView: null,
  modalPanel: null,
  subscriptions: null,

  pathToConfig: null,
  rootDirectory: null,

  searchResults: [],

  activate(state) {
    this.config = atom.config.get('atom-related-files');
    this.rootDirectory = atom.project.getPaths()[0];

    this.emberRelatedFilesView = new EmberRelatedFilesView(state.emberRelatedFilesViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.emberRelatedFilesView.getElement(),
      visible: false,
    });

    emiter.on('hide-panel', this.hidePanel.bind(this));

    atom.config.observe('atom-related-files', () => {
      this.config = atom.config.get('atom-related-files');
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'atom-related-files:toggle': () => this.toggle(),
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

  async getConfigFile() {
    const configReq = this.config.pathToRegexs.map((pathToConfig) => {
      const filePath = path.resolve(this.rootDirectory, pathToConfig);

      return new Promise((res, rej) => {
        fs.readFile(filePath, 'utf8', (err, configData) => {
          if (err) {
            rej(err);
          } else {
            try {
              const parsedData = JSON.parse(configData);
              res(parsedData);
            } catch (error) {
              rej(error);
            }
          }
        });
      });
    });

    const configs = await Promise.all(configReq);

    return configs;
  },

  async toggle() {
    this.searchResults = [];

    const config = await this.getConfigFile().catch(
      () => {
        atom.notifications.addError('Missing config');
        return null;
      },
    );

    if (!config) {
      return null;
    }

    const rootDirectory = this.rootDirectory;

    const parsedConfig = this.parseConfig(config);
    if (!parsedConfig) {
      return null;
    }

    const configArray = this.mapConfigToArray(parsedConfig);
    const currentFileAbsolutePath = atom.workspace.getActivePaneItem().buffer.file.path;
    const currentFileRelativePath = currentFileAbsolutePath.replace(this.rootDirectory, '');
    emiter.emit('did-search-start', currentFileRelativePath);

    const testsResults = this.runTests(configArray, currentFileAbsolutePath);

    testsResults.forEach((searchEntry) => {
      const dirToSearch = path.join(rootDirectory, searchEntry.searchDir);

      this.parsePath(dirToSearch, (data) => {
        const files = data.filter(dir => dir.isFile);

        files.forEach((file) => {
          const testResult = searchEntry.testResult;
          let searchRegexString = searchEntry.search;

          testResult.forEach((result, index) => {
            searchRegexString = searchRegexString.replace(`(${index})`, result);
          });

          const searchRegex = new RegExp(searchRegexString);
          const fileMatch = searchRegex.test(file.path);

          if (fileMatch) {
            this.searchResults.push({
              ...file,
              label: searchEntry.label,
              relativePath: file.path.replace(`${this.rootDirectory}/`, ''),
            });
          }
        });

        emiter.emit('did-search-finish', this.searchResults);
      });
    });

    // clear items from list when file did not pass test
    if (testsResults.length === 0) {
      emiter.emit('did-search-finish', this.searchResults);
    }

    return this.toggelPanel();
  },

  toggelPanel() {
    return (
      this.modalPanel.isVisible() ?
        this.modalPanel.hide() :
        this.modalPanel.show()
    );
  },

  hidePanel() {
    if (this.modalPanel.isVisible()) {
      return this.modalPanel.hide();
    }

    return null;
  },

  runTests(configArray, filePath) {
    return configArray.reduce((results, config) => {
      const testResult = filePath.match(config.test);

      if (testResult) {
        results.push({
          ...config,
          testResult,
        });
      }

      return results;
    }, []);
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
      });
    });
  },

  parseConfig(configs) {
    if (!configs) {
      atom.notifications.addWarning('Parse config failed, pleae check your config file');
      return false;
    }

    const parsedConfig = configs.map((configSet, index) => {
      Object.keys(configSet).forEach((key) => {
        const config = configSet[key];

        // Set labels for every config entry
        if (!config.label) {
          config.label = key;
        }

        // Change key for unique so we can merge these objects later
        configSet[`${key}_${index}`] = configSet[key];
        delete configSet[key];
      });

      return configSet;
    });

    // Merge all configs into one object
    const mergedConfig = parsedConfig.reduce((acumulatedConfig, nextConfig) =>
      ({ ...acumulatedConfig, ...nextConfig }), {});

    const mainKeys = Object.keys(mergedConfig);
    const mainKeyslength = mainKeys.length;

    let isSchemaOk = true;

    for (let j = 0; j < mainKeyslength; j++) {
      const testObject = mergedConfig[mainKeys[j]];
      const propertyKeys = Object.keys(testObject);
      const propertyLength = propertyKeys.length;

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

    return isSchemaOk ? mergedConfig : null;
  },

  config: {
    pathToRegexs: {
      type: 'array',
      default: ['./regex.json'],
      items: {
        type: 'string',
      },
    },
  },

};
