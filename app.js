const Homey = require('homey');
const FlowSelections = require('./lib/flowselections');
const Constants = require('./lib/constants');

class ToshibaACApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('ToshibaACApp has been initialized');
    this.initFlows();
    this.initConditions();
  }

  async initFlows() {
    // mode
    const modeActionCard = this.homey.flow.getActionCard('SetMode');
    modeActionCard.registerRunListener(async (args, state) => {
      const { device } = args;

      const acMode = await device.getStoreValue(Constants.StoredCapabilityTargetACMode);
      await device.setCapabilityValue(acMode, args.acMode.id);
      if (args.meritA) {
        await device.setCapabilityValue(Constants.CapabilityTargetMeritA, args.meritA.id);
      }
      if (args.meritB && device.hasCapability(Constants.CapabilityTargetMeritB)) {
        await device.setCapabilityValue(Constants.CapabilityTargetMeritB, args.meritB.id);
      };
    });

    modeActionCard.registerArgumentAutocompleteListener('acMode', async (query, args) => {
      const { device } = args;
      const results = FlowSelections.getModeResult(device, true);
      return device.getResult(results, query);
    });

    modeActionCard.registerArgumentAutocompleteListener('meritA', async (query, args) => {
      const acMode = args.acMode.id;
      const { device } = args;
      let results = [];
      if (acMode) {
        results = FlowSelections.getMeritAResult(device, acMode);
      }
      return device.getResult(results, query);
    });

    modeActionCard.registerArgumentAutocompleteListener('meritB', async (query, args) => {
      const acMode = args.acMode.id;
      const { device } = args;
      let results = [];
      if (acMode) {
        results = FlowSelections.getMeritBResult(device, acMode);
      }
      return device.getResult(results, query);
    });

    // swing mode
    const swingModeActionCard = this.homey.flow.getActionCard('SetSwingMode');
    swingModeActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      const swingMode = await device.getStoreValue(Constants.StoredCapabilityTargetSwingMode);
      await device.setCapabilityValue(swingMode, args.acSwingMode.id);
    });

    swingModeActionCard.registerArgumentAutocompleteListener('acSwingMode', async (query, args) => {
      const { device } = args;
      const results = FlowSelections.getSwingModeResult(device, true);
      return device.getResult(results, query);
    });

    // power mode
    const powerModeActionCard = this.homey.flow.getActionCard('SetPowerMode');
    powerModeActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.setCapabilityValue(Constants.CapabilityTargetPowerMode, args.acPowerMode.id);
    });

    powerModeActionCard.registerArgumentAutocompleteListener('acPowerMode', async (query, args) => {
      const { device } = args;
      const results = FlowSelections.getPowerModeResult();
      return device.getResult(results, query);
    });

    // fan mode
    const fanModeActionCard = this.homey.flow.getActionCard('SetFanMode');
    fanModeActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.setCapabilityValue(Constants.CapabilityTargetFanMode, args.acFanMode.id);
    });

    fanModeActionCard.registerArgumentAutocompleteListener('acFanMode', async (query, args) => {
      const { device } = args;
      const results = FlowSelections.getFanModeResult();
      return device.getResult(results, query);
    });

    // target temperature
    const targetTemperatureActionCard = this.homey.flow.getActionCard('SetTargetTemperature');
    targetTemperatureActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.setCapabilityValue(Constants.CapabilityTargetTemperatureInside, args.targetTemperature);
    });

    // target air pure
    const targetAirPureActionCard = this.homey.flow.getActionCard('SetTargetAirPureIon');
    targetAirPureActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.setCapabilityValue(Constants.CapabilityTargetAirPureIon, args.targetAirPureIon);
    });

    //send to AC
    const sendToACActionCard = this.homey.flow.getActionCard('SendToAC');
    sendToACActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.updateStateAfterUpdateCapability();
    });
  }

  initConditions() {
    // outside temperature above
    const outsideTemperatureAboveCondition = this.homey.flow.getConditionCard('OutsideTemperatureAbove');
    outsideTemperatureAboveCondition.registerRunListener(async (args, state) => {
      const { device } = args;
      const outsideTemperature = await device.getCapabilityValue(Constants.CapabilityMeasureTemperaturOutside);
      return outsideTemperature > args.trashholdTemp;
    });

    // outside temperature below
    const outsideTemperatureBelowCondition = this.homey.flow.getConditionCard('OutsideTemperatureBelow');
    outsideTemperatureBelowCondition.registerRunListener(async (args, state) => {
      const { device } = args;
      const outsideTemperature = await device.getCapabilityValue(Constants.CapabilityMeasureTemperaturOutside);
      return outsideTemperature < args.trashholdTemp;
    });

    // inside temperature above
    const insideTemperatureAboveCondition = this.homey.flow.getConditionCard('InsideTemperatureAbove');
    insideTemperatureAboveCondition.registerRunListener(async (args, state) => {
      const { device } = args;
      const insideTemperature = await device.getCapabilityValue(Constants.CapabilityMeasureTemperatureInside);
      return insideTemperature > args.trashholdTemp;
    });

    // inside temperature below
    const insideTemperatureBelowCondition = this.homey.flow.getConditionCard('InsideTemperatureBelow');
    insideTemperatureBelowCondition.registerRunListener(async (args, state) => {
      const { device } = args;
      const insideTemperature = await device.getCapabilityValue(Constants.CapabilityMeasureTemperatureInside);
      return insideTemperature < args.trashholdTemp;
    });
  }

}

module.exports = ToshibaACApp;
