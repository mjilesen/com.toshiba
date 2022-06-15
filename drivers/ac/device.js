const { Device } = require('homey');
const httpApi = require( "../../lib/ToshibaHttpApi");
const amqpApi = require( "../../lib/ToshibaAmqpApi");
const StateUtils = require ("../../lib/state_utils");
const Constants = require("../../lib/constants");

class ACDevice extends Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    //initialize the http api
    const initial_state = await this.driver.httpAPI.getACStatus( this.getData().DeviceId );
    this.updateState( initial_state );

    // initialize the capability listeners
    this.registerMultipleCapabilityListener( [Constants.CapabilityOnOff,
                                              Constants.CapabilityTargetACMode,
                                              Constants.CapabilityTargetTemperatureInside]
                                              , async ( capabilityValues, capabilityOptions ) => {
      await this.updateCapabilities( capabilityValues );
      }
    );

  // this.registerCapabilityListener( Constants.CapabilityTargetACMode, async (value) => {
//     this.updateCapability( Constants.CapabilityTargetACMode, value);
//     }
//   );

  // this.registerCapabilityListener(Constants.CapabilityTargetTemperatureInside, async (value) => {
  //  this.updateCapability( Constants.CapabilityTargetTemperatureInside, value);
//    }
  //);

  // this.registerCapabilityListener("target_fan_mode", async (value) => {
    //do nothing, just setting the value
  // });

};

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('ACDevice has been added');
  };

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
  };

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('ACDevice was renamed');
  };

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('ACDevice has been deleted' );
  };

  async updateCapabilities( capabilityValues ){
     for( let[key, value] of Object.entries( capabilityValues) ){
       await this.setCapabilityValue( key, value )
     }
     const state = StateUtils.convertCapabilitiesToState( this )
     this.setStoreValue( Constants.StoredValueState, state )
     this.driver.amqpAPI.sendMessage( state, this.getData().DeviceUniqueID )
  };

  updateStateAfterHeartBeat(insideTemperature, outsideTemperature ){
      StateUtils.setOutsideTemperature( this, outsideTemperature );
      StateUtils.setInsideTemperature( this, insideTempererature );
  };

  updateState( state ){
    const currentState = this.getStoreValue( Constants.StoredValueState );
    if ( currentState != state )
    {
      this.setStoreValue( Constants.StoredValueState, state );
      StateUtils.convertStateToCapabilities( this, state );
    }
  };
};

module.exports = ACDevice;
