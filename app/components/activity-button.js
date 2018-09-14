import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { PropTypes } from 'ember-prop-types'

export default Component.extend({

  propTypes: {
    action: PropTypes.string,
    activity: PropTypes.object,
    onClick: PropTypes.fun,
  },

  classNameBindings: ['activity.color'],

  click() {
    this.onClick(this.activity);
  }
});
