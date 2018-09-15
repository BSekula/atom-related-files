'use babel';
/** @jsx etch.dom */

import etch from 'etch';
import SelectList from 'atom-select-list';
import { emiter } from './helpers/emiterService';
import ItemRow from './ItemRow';

class ListView {
  constructor(props) {
    this.items = [];

    debugger;

    emiter.on('did-search-finish', this.onDidSearch);

    this.onDidSearch = this.onDidSearch.bind(this);
    etch.initialize(this);
  }

  render() {
    return (
      <SelectList items={this.items} elementForItem={this.getElementFormItem} />
    );
  }

  onDidSearch = (data) => {
    this.items = data;
    this.update();
  }

  getElementFormItem = (item) => {
    return new ItemRow({ item}).element;
  }

  update (props, children) {
    return etch.update(this)
  }

  async destroy() {
    await etch.destroy(this);
  }
}

export default ListView;
