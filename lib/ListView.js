'use babel';

/** @jsx etch.dom */

import etch from 'etch';
import SelectList from 'atom-select-list';
import { emiter } from './helpers/emiterService';
import ItemRow from './ItemRow';

class ListView {
  constructor(props) {
    this.items = [];
    this.currentSearchedFilePath = 'No file!!';

    this.onDidSearch = this.onDidSearch.bind(this);
    this.onStartSearch = this.onStartSearch.bind(this);
    emiter.on('did-search-finish', this.onDidSearch);
    emiter.on('did-search-start', this.onStartSearch);
    etch.initialize(this);
  }

  render() {
    return (
      <SelectList
        ref="ListView"
        items={this.items}
        elementForItem={this.getElementFormItem}
        didConfirmSelection={(item) => {
          emiter.emit('hide-panel');
          atom.workspace.open(item.path);
        }}
        didConfirmEmptySelection={() => emiter.emit('hide-panel')}
        didCancelSelection={() => emiter.emit('hide-panel')}
        emptyMessage="   Nothing to see"
        infoMessage={`Search for: ${this.currentSearchedFilePath}`}
        filter={this.filter}
      />
    );
  }

  filter = (items, query) => {
    if (query.length < 2) {
      return items;
    }

    const stringRegex = query.split('').join('(.*)');
    const regex = new RegExp(stringRegex);
    return items.filter(item =>
      regex.test(item.label) || regex.test(item.name) || regex.test(item.relativePath),
    );
  }

  onDidSearch = (data) => {
    this.items = data;

    this.update();
  }

  onStartSearch = (currentSearchedFilePath) => {
    this.currentSearchedFilePath = currentSearchedFilePath;
  }

  getElementFormItem = (item) => {
    return new ItemRow({ item }).element;
  }

  update (props, children) {
    return etch.update(this)
  }

  async destroy() {
    await etch.destroy(this);
  }
}

export default ListView;
