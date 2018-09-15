'use babel';

/** @jsx etch.dom */
import ListView from './ListView';

export default class EmberRelatedFilesView {
  constructor(serializedState) {

    // this.element = document.createElement('div');
    // this.element.classList.add('ember-related-files');

    this.items = [];

    this.relatedFilesList = new ListView({
      items: this.items,
      elementForItem: this.getElementFormItem,
      filter: (items, query) => items,
      didConfirmSelection: (item) => {
        debugger;
        // this.relatedFilesList.hide();
      }
    })

    // this.element.appendChild(this.relatedFilesList.element);

    const splitUp = () => { this.splitOpenPath((pane) => pane.splitUp.bind(pane)) }
    const splitDown = () => { this.splitOpenPath((pane) => pane.splitDown.bind(pane)) }
    atom.commands.add(this.relatedFilesList.element, {
      'pane:split-up': splitUp,
      'pane:split-up-and-copy-active-item': splitUp,
      'pane:split-up-and-move-active-item': splitUp,
      'pane:split-down': splitDown,
      'pane:split-down-and-copy-active-item': splitDown,
      'pane:split-down-and-move-active-item': splitDown,
    });
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.relatedFilesList.remove();
  }

  getElement() {
    return this.relatedFilesList;
  }
}
