'use babel';

/** @jsx etch.dom */
import etch from 'etch';

class ItemRow {
  constructor(props) {
    this.item = props.item;

    etch.initialize(this);
  }

  render() {
    return (
      <li>
        <div><b>{this.item.label}</b></div>
        <div>{this.item.name}</div>
        <div>{this.item.path}</div>
      </li>
    );
  }

  update (props, children) {
    return etch.update(this)
  }

  async destroy() {
    await etch.destroy(this);
  }

}

export default ItemRow;
