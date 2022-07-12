const { Device } = require('homey');
const StateUtils = require ("../../lib/state_utils");
const ACFeatures = require ("../../lib/ToshibaACFeatures");
const Constants = require("../../lib/constants");
const FlowSelections = require("../../lib/flowselections");

let acMode ="";
let swingMode = "";

class ACDevice extends Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    await this.initCapabilities();
    this.initFlows();
    this.initConditions();
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

  async initCapabilities(){
    // initialize the capability listeners
    acMode    = await this.getStoreValue( Constants.StoredCapabilityTargetACMode);
    swingMode = await this.getStoreValue( Constants.StoredCapabilityTargetSwingMode );

    let capabilities = [ Constants.CapabilityOnOff,
                         Constants.CapabilityTargetTemperatureInside,
                         Constants.CapabilityTargetFanMode,
                         Constants.CapabilityTargetPowerMode,
                       ]
    //do not add if capabilities not added (yet)
    if( acMode ){
      capabilities.push( acMode )
    }
    if( swingMode ){
      capabilities.push( swingMode )
    }

    this.registerMultipleCapabilityListener( capabilities,
                                              async ( capabilityValues, capabilityOptions ) => {
      await this.updateCapabilities( capabilityValues );
      }
    );
  };

  initConditions(){
    //outside temperature above
    const outsideTemperatureAboveCondition = this.homey.flow.getConditionCard('OutsideTemperatureAbove');
    outsideTemperatureAboveCondition.registerRunListener(async (args, state) => {
      const outsideTemperature = await this.getCapabilityValue( Constants.CapabilityMeasureTemperaturOutside );
      return outsideTemperature > args.trashholdTemp;
    });

    //outside temperature below
    const outsideTemperatureBelowCondition = this.homey.flow.getConditionCard('OutsideTemperatureBelow');
    outsideTemperatureBelowCondition.registerRunListener(async (args, state) => {
      const outsideTemperature = await this.getCapabilityValue( Constants.CapabilityMeasureTemperaturOutside );
      return outsideTemperature < args.trashholdTemp;
    });

    //inside temperature above
    const insideTemperatureAboveCondition = this.homey.flow.getConditionCard('InsideTemperatureAbove');
    insideTemperatureAboveCondition.registerRunListener(async (args, state) => {
      const insideTemperature = await this.getCapabilityValue( Constants.CapabilityMeasureTemperatureInside );
      return insideTemperature > args.trashholdTemp;
    });

    //inside temperature below
    const insideTemperatureBelowCondition = this.homey.flow.getConditionCard('InsideTemperatureBelow');
    insideTemperatureBelowCondition.registerRunListener(async (args, state) => {
      const insideTemperature = await this.getCapabilityValue( Constants.CapabilityMeasureTemperatureInside );
      return insideTemperature < args.trashholdTemp;
    });
  };

  async initFlows(){
    //mode
    const modeActionCard = this.homey.flow.getActionCard( "SetMode");
    modeActionCard.registerRunListener(async (args, state) => {
        this.setCapabilityValue( acMode, args.acMode.id )
    });

    modeActionCard.registerArgumentAutocompleteListener('acMode', async (query, args) => {
      const results = FlowSelections.getModeResult( this );
      return this.getResult( results, query );
    });

    //swing mode
    const swingModeActionCard = this.homey.flow.getActionCard( "SetSwingMode");
    swingModeActionCard.registerRunListener(async (args, state) => {
        this.setCapabilityValue( swingMode, args.acSwingMode.id )
    });

    swingModeActionCard.registerArgumentAutocompleteListener('acSwingMode', async (query, args) => {
       const results = FlowSelections.getSwingModeResult( this );
       return this.getResult( results, query );
   });

   //power mode
   const powerModeActionCard = this.homey.flow.getActionCard( "SetPowerMode");
   powerModeActionCard.registerRunListener(async (args, state) => {
       this.setCapabilityValue( Constants.CapabilityTargetPowerMode, args.acPowerMode.id )
   });

   powerModeActionCard.registerArgumentAutocompleteListener('acPowerMode', async (query, args) => {
      const results = FlowSelections.getPowerModeResult();
      return this.getResult( results, query );
   });

   //fan mode
   const fanModeActionCard = this.homey.flow.getActionCard( "SetFanMode");
   fanModeActionCard.registerRunListener(async (args, state) => {
       this.setCapabilityValue( Constants.CapabilityTargetFanMode, args.acFanMode.id )
   });

   fanModeActionCard.registerArgumentAutocompleteListener('acFanMode', async (query, args) => {
      const results = FlowSelections.getFanModeResult();
      return this.getResult( results, query );
   });

    //target temperature
    const targetTemperatureActionCard = this.homey.flow.getActionCard( "SetTargetTemperature");
    targetTemperatureActionCard.registerRunListener(async (args, state) => {
        this.setCapabilityValue( Constants.CapabilityTargetTemperatureInside, args.targetTemperature )
    });
  };

  async updateCapabilities( capabilityValues ){
    let onoffChanged = this.getCapabilityValue( Constants.CapabilityOnOff )
     for( let[key, value] of Object.entries( capabilityValues) ){
       await this.setCapabilityValue( key, value )
       onoffChanged = onoffChanged || ( key === Constants.CapabilityOnOff )
     }
    await this.updateStateAfterUpdateCapability( onoffChanged )
  };

  async updateStateAfterUpdateCapability( onoffChanged ){
    const state = StateUtils.convertCapabilitiesToState( this )
    await this.setStoreValue( Constants.StoredValueState, state )

    //only send message when airco is turned on or OnOff capability changed
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

  getResult( results, query ){
    // filter based on the query
    return results.filter((result) => {
       return result.name.toLowerCase().includes(query.toLowerCase());
       });
  };


};
module.exports = ACDevice;
