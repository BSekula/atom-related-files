import Component from '@ember/component';
import { set, get, computed } from "@ember/object"
import { PropTypes } from 'ember-prop-types'
import { filterBy } from '@ember/object/computed';

export default Component.extend({
  propTypes: {
    onActivityClick: PropTypes.fun,
    activities: PropTypes.array
  },

  activeActivities: filterBy('activities', 'isActive', true),

});
