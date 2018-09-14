'use babel';

/** @jsx etch.dom */
import SelectList from 'atom-select-list';
import ItemRow from './ItemRow';

export default class EmberRelatedFilesView {

  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('ember-related-files');

    this.relatedFilesList = new SelectList({
      items: ['Alice', 'Bob', 'Carol'],
      elementForItem: this.getElementFormItem,
      filter: (items, query) => items,
      didConfirmSelection: (item) => {
        this.relatedFilesList.hide();
      }
    })

    this.element.appendChild(this.relatedFilesList.element);

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

  getElementFormItem = (item) => {
    return new ItemRow({item}).element;
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
