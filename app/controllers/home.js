import Controller from '@ember/controller';
import { computed } from '@ember/object'

export default Controller.extend({
  actions: {
    onActivityClick(activity) {
      this.store.find('activity', activity.id).then((activity) => {
        activity.set('isActive', !activity.isActive);
        activity.save();
      });
    }
  }
});
