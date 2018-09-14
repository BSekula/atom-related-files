'use babel';

import { CompositeDisposable } from 'atom';
import EmberRelatedFilesView from './ember-related-files-view';
const path = require('path');
const fs = require('fs');
// import { parsePath } from './crawler';

//const parsePath = require('./crawler.js');

const CONFIG_SHEMA = [/*'matchNumber',*/ 'search', 'searchDir', 'test'];

export default {
  emberRelatedFilesView: null,
  modalPanel: null,
  subscriptions: null,
  config: null,
  searchResults: [],

  activate(state) {
    this.config = atom.config.get('ember-related-files');

    this.emberRelatedFilesView = new EmberRelatedFilesView(state.emberRelatedFilesViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.emberRelatedFilesView.getElement(),
      visible: false
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'ember-related-files:toggle': () => this.toggle(),
      }),
      atom.config.observe('ember-related-files', {}, (config) => {
        this.config = config;
        this.verifyConfig();
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
      emberRelatedFilesViewState: this.emberRelatedFilesView.serialize()
    };
  },

  async toggle() {
    const isOk = this.verifyConfig();
    if (!isOk) {
      return null;
    }

    const { config } = this;

    const currentFileAbsolutePath = atom.workspace.getActivePaneItem().buffer.file.path;
    const tests = Object.keys(config);

    const matchTest = tests.filter(key =>
      new RegExp(config[key].test).test(currentFileAbsolutePath),
    );

    if (matchTest.length === 0) {
      return null;
    }

    debugger;
    const rootDirectory = atom.project.getPaths()[0];
    const search = config['isTemplateComponent'].search;
    const searchDir = config['isTemplateComponent'].searchDir;
    const absolutePath = path.join(rootDirectory, searchDir);

    console.log(parsePath)

debugger
    // parsePath(absolutePath, (data) => {
    //   const files = data.filter(dir => dir.isFile);
    //   files.forEach(file => console.log(file.name));
    // })

    // return (
    //   this.modalPanel.isVisible() ?
    //     this.modalPanel.hide() :
    //     this.modalPanel.show()
    // );
  },

  verifyConfig() {
    const { config } = this;

    if (!config) {
      atom.notifications.addWarning('Missing config');
      return false;
    }

    const searchKeys = Object.keys(config);
    const searchlength = searchKeys.length;

    let isSchemaOk = true;

    for (let i = 0; i < searchlength; i++) {
      const keyEntry = config[searchKeys[i]];

      CONFIG_SHEMA.forEach((key) => { // eslint-disable-line no-loop-func
        if (!keyEntry[key]) {
          isSchemaOk = false;
          atom.notifications.addWarning(`Missing config field: ${searchKeys[i]} -> ${key}`);
        }
      });
    }


    return isSchemaOk;
  },
};
