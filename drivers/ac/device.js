const { Device } = require('homey');
const StateUtils = require ("../../lib/state_utils");
const ACFeatures = require ("../../lib/ToshibaACFeatures");
const Constants = require("../../lib/constants");

class ACDevice extends Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    // initialize the capability listeners
    const acMode    = await this.getStoreValue( Constants.StoredCapabilityTargetACMode);
    const swingMode = await this.getStoreValue( Constants.StoredCapabilityTargetSwingMode );

    this.registerMultipleCapabilityListener( [Constants.CapabilityOnOff,
                                              acMode,
                                              Constants.CapabilityTargetTemperatureInside,
                                              Constants.CapabilityTargetFanMode,
                                              Constants.CapabilityTargetPowerMode,
                                              swingMode
                                              ],
                                              async ( capabilityValues, capabilityOptions ) => {
      await this.updateCapabilities( capabilityValues );
      }
    );
};

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('ACDevice has been added');
    //determine the capabilities for this type of AC
    await ACFeatures.setCapabilities( this )
    //set starting values for the AC
    const state = await this.getStoreValue( Constants.StoredValueState );
    StateUtils.convertStateToCapabilities( this, state );
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
    let onoffChanged = this.getCapabilityValue( Constants.CapabilityOnOff )
     for( let[key, value] of Object.entries( capabilityValues) ){
       await this.setCapabilityValue( key, value )
       onoffChanged = onoffChanged || ( key === Constants.CapabilityOnOff )
     }

     const state = StateUtils.convertCapabilitiesToState( this )
     await this.setStoreValue( Constants.StoredValueState, state )

     if ( onoffChanged ){
        this.driver.amqpAPI.sendMessage( state, this.getData().DeviceUniqueID )
     }
  };

  updateStateAfterHeartBeat(insideTemperature, outsideTemperature ){
      StateUtils.setOutsideTemperature( this, outsideTemperature );
      StateUtils.setInsideTemperature( this, insideTemperature );
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
