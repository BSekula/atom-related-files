'use babel';

import { CompositeDisposable } from 'atom';
import EmberRelatedFilesView from './atom-related-files-view';
import { emiter } from './helpers/emiterService';
import { parseConfig, getConfigFile } from './helpers/config'; // TODO cpnfused name with settings
import { parsePath } from './helpers/paths';
import { ERRORS } from './helpers/settings';

const path = require('path');

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

  async toggle() {
    this.searchResults = [];
    const { rootDirectory, config } = this;

    const configs = await getConfigFile(rootDirectory, config).catch(
      (errMsg) => { return this.dispayError(ERRORS.missingConfig, errMsg); }
    );

    if (!configs) {
      return null;
    }

    const parsedConfig = parseConfig(configs);
    if (!parsedConfig) {
      return this.dispayError(ERRORS.configParseError);
    }

    const configArray = this.mapConfigToArray(parsedConfig);
    const currentFileAbsolutePath = atom.workspace.getActivePaneItem().buffer.file.path;
    const currentFileRelativePath = currentFileAbsolutePath.replace(rootDirectory, '');

    emiter.emit('did-search-start', currentFileRelativePath);

    // Run tests for current file
    const testsResults = this.runTests(configArray, currentFileAbsolutePath);

    testsResults.forEach((searchEntry) => {
      const dirToSearch = path.join(rootDirectory, searchEntry.searchDir);

      parsePath(dirToSearch, (data) => {
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

  dispayError(error, errMsg = null) {
    let message = '';
    let severity = 'addError';

    if (errMsg) {
      console.error(errMsg); //eslint-disable-line
    }

    switch (error) {
      case ERRORS.missingConfig:
        message = 'Missing config file !!!';
        severity = 'addError';
        break;
      case ERRORS.configParseError:
        message = 'Parse config error !!!';
        severity = 'addError';
        break;
      default:
        message = 'Something went wrong';
        severity = 'addError';
        break;
    }

    atom.notifications[severity](message);
    return null;
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
