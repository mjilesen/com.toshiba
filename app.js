'use strict';

const Homey = require('homey');

class ToshibaACApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('ToshibaACApp has been initialized');
  }

}

module.exports = ToshibaACApp;
