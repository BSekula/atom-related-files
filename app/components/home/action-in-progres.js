import Component from '@ember/component';

export default Component.extend({
  actions: {
    click(activity) {
      this.onClick(activity);
    }
  }  
});
