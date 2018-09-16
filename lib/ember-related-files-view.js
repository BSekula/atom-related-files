'use babel';

/** @jsx etch.dom */
import ListView from './ListView';
import { emiter } from './helpers/emiterService';

export default class EmberRelatedFilesView {
  constructor(serializedState) {
    this.items = [];
    this.setFocus = this.setFocus.bind(this);
    emiter.on('did-search-finish', this.setFocus);

    this.relatedFilesList = new ListView({});
    this.relatedFilesList.element.classList.add('ember-related-files');

    const splitUp = () => { this.splitOpenPath(pane => pane.splitUp.bind(pane)); };
    const splitDown = () => { this.splitOpenPath(pane => pane.splitDown.bind(pane)); };
    atom.commands.add(this.relatedFilesList.element, {
      'pane:split-up': splitUp,
      'pane:split-up-and-copy-active-item': splitUp,
      'pane:split-up-and-move-active-item': splitUp,
      'pane:split-down': splitDown,
      'pane:split-down-and-copy-active-item': splitDown,
      'pane:split-down-and-move-active-item': splitDown,
    });
  }

  setFocus() {
    this.relatedFilesList.refs.ListView.focus();
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.relatedFilesList.destroy();
  }

  getElement() {
    return this.relatedFilesList;
  }
}
