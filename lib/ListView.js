'use babel';
/** @jsx etch.dom */

import etch from 'etch';
import SelectList from 'atom-select-list';
import { emiter } from './helpers/emiterService';
import ItemRow from './ItemRow';

class ListView {
  constructor(props) {
    this.items = [];
    this.onDidSearch = this.onDidSearch.bind(this);
    emiter.on('did-search-finish', this.onDidSearch);
    etch.initialize(this);
  }

  render() {
    return (
      <SelectList
        ref="ListView"
        items={this.items}
        elementForItem={this.getElementFormItem}
        didConfirmSelection = { (item) => {
          emiter.emit('hide-panel');
          atom.workspace.open(item.path);
        }}
        didConfirmEmptySelection = {() => emiter.emit('hide-panel')}
        didCancelSelection = {() => emiter.emit('hide-panel')}
        emptyMessage = 'Nothing to see'
        infoMessage = {`Current File ${atom.workspace.getActivePaneItem().buffer.file.path}`}
      />
    );
  }

  onDidSearch = (data) => {
    this.items = data;
    this.update();
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
