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
        {this.item}
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
