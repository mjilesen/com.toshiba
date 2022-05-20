'use strict';

const { Device } = require('homey');
const ACHelper = require( "../../lib/AC");
const StateUtils = require ("../../lib/state_utils")

class ACDevice extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('MyDevice has been initialized');
    this.acHelper = new ACHelper(this.homey, this.getSetting( "username"), this.getSetting( "password"), this.getStoreValue( "tokeninformation") );

    this.registerCapabilityListener("onoff", async (value) => {
     console.log( "onoff changed", value );
    });

   this.registerCapabilityListener("target_ac_mode", async (value) => {
      //do nothing, just setting the value
   });

   this.registerCapabilityListener("target_temperature.inside", async (value) => {
    //do nothing, just setting the value
   });

   this.registerCapabilityListener("target_fan_mode", async (value) => {
    //do nothing, just setting the value
   });
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
    StateUtils.convertStateToCapabilities( this, this.getStoreValue("state"))
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

}

module.exports = ACDevice;
