'use babel';

import { Emitter } from 'atom';

class EmiterService {
  constructor() {
    this.emiter = new Emitter();
  }

  on(event, callback) {
    this.emiter.on(event, callback);
  }

  emit(event, props) {
    this.emiter.emit(event, props);
  }
}

export const emiter = new EmiterService();
