const { Device } = require('homey');
const httpApi = require( "../../lib/ToshibaHttpApi");
const amqpApi = require( "../../lib/ToshibaAmqpApi");
const StateUtils = require ("../../lib/state_utils");

class ACDevice extends Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    //initialize the http api
    const initial_state = await this.driver.httpAPI.getACStatus( this.getData().DeviceId );
    this.updateState( initial_state );

    // initialize the capability listeners
    this.registerCapabilityListener("onoff", async (value) => {
      if( !value ){
      this.driver.amqpAPI.sendMessage( "31ffffffffffffffffffffffffffffffffffff", this.getData().DeviceUniqueID )}
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
    this.log('ACDevice has been added');
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
    this.log('ACDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('ACDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('ACDevice has been deleted', this.driver.getDevices().length );

  }

  updateState( state ){
    this.setStoreValue( "state", state );
    StateUtils.convertStateToCapabilities( this, state );
  }
}

module.exports = ACDevice;
