const { Device } = require('homey');
const { DateTime } = require('luxon');
const StateUtils = require('../../lib/stateUtils');
const {
  logError, setCapabilities, disabledMeritAForMode, disabledMeritBForMode,
} = require('../../lib/acFeatures');
const Constants = require('../../lib/constants');
const ValidityChecks = require('../../lib/validityChecks');

let acMode = '';
let swingMode = '';
const capabilitiesInFlow = [Constants.CapabilityTargetTemperatureInside,
  Constants.CapabilityTargetMeritA,
  Constants.CapabilityTargetMeritB,
  Constants.CapabilityTargetAirPureIon,
  Constants.CapabilityTargetPowerMode,
  Constants.CapabilityTargetFanMode,
  Constants.CapabilityTargetACMode1,
  Constants.CapabilityTargetACMode2,
  Constants.CapabilityTargetACMode3,
  Constants.CapabilityTargetSwingMode1,
  Constants.CapabilityTargetSwingMode2,
  Constants.CapabilityTargetSwingMode3,
  Constants.CapabilityTargetSwingMode4];

class ACDevice extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    await this.initCapabilities().catch(error => logError(this, error));
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('ACDevice has been added');
    // determine the capabilities for this type of AC
    await setCapabilities(this).catch(error => logError(this, error));
    // set starting values for the AC
    const state = await this.getStoreValue(Constants.StoredValueState).catch(error => logError(this, error));
    StateUtils.convertStateToCapabilities(this, state);
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
    this.log('ACDevice has been deleted');
    if (this.timerId) {
      this.homey.clearInterval(this.timerId);
    }
  }

  async initCapabilities() {
    // initialize the capability listeners
    acMode = this.getStoreValue(Constants.StoredCapabilityTargetACMode);
    swingMode = this.getStoreValue(Constants.StoredCapabilityTargetSwingMode);

    const capabilities = [
      Constants.CapabilityOnOff,
      Constants.CapabilityTargetTemperatureInside,
      Constants.CapabilityTargetFanMode,
      Constants.CapabilityTargetPowerMode,
      Constants.CapabilityTargetMeritA,
    ];
    // do not add if capabilities not added (yet)
    if (acMode) {
      capabilities.push(acMode);
    }
    if (swingMode) {
      capabilities.push(swingMode);
    }
    if (this.hasCapability(Constants.CapabilityTargetMeritB)) {
      capabilities.push(Constants.CapabilityTargetMeritB);
    }

    this.registerMultipleCapabilityListener(
      capabilities,
      async (capabilityValues, capabilityOptions) => {
        await this.updateCapabilities(capabilityValues).catch(error => logError(this, error));
      },
    );
  }

  async updateCapabilities(capabilityValues) {
    const isValid = ValidityChecks.isValid(this, capabilityValues);
    if (!isValid.valid) {
      throw new Error(isValid.errormessage);
    }
    for (const [key, value] of Object.entries(capabilityValues)) {
      const oldvalue = this.getCapabilityValue(key);
      await this.setCapabilityValue(key, value).catch(error => logError(this, error));
      if (
        key === Constants.CapabilityTargetMeritA
        && value === Constants.MeritA_Heating_8C
      ) {
        await this.setCapabilityValue(acMode, Constants.Heat).catch(error => logError(this, error));
        // in 8C mode, meritB has to be turned off
        if (this.hasCapability(Constants.CapabilityTargetMeritB)) {
          await this.setCapabilityValue(Constants.CapabilityTargetMeritB, Constants.MeritB_Off).catch(error => logError(this, error));
        }
      }

      await this.resetMeritA(key, value).catch(error => logError(this, error));
      if (this.hasCapability(Constants.CapabilityTargetMeritB)) {
        await this.resetMeritB(key, value).catch(error => logError(this, error));
      }

      this.startTrigger(key, oldvalue, value);
    }
    await this.setStatusCapability().catch(error => logError(this, error));
    await this.updateStateAfterUpdateCapability().catch(error => logError(this, error));
  }

  async resetMeritA(key, value) {
    if (
      key === Constants.CapabilityTargetACMode1
      || key === Constants.CapabilityTargetACMode2
      || key === Constants.CapabilityTargetACMode3
    ) {
      const valueMeritA = await this.getCapabilityValue(
        Constants.CapabilityTargetMeritA,
      ).catch(error => logError(this, error));
      const isValidMeritA = ValidityChecks.checkSupportedMeritForMode(
        this,
        Constants.CapabilityTargetMeritA,
        valueMeritA,
        value,
        disabledMeritAForMode,
      ).valid;
      if (!isValidMeritA) {
        await this.setCapabilityValue(
          Constants.CapabilityTargetMeritA,
          Constants.MeritA_Off,
        ).catch(error => logError(this, error));
      }
    }
  }

  async resetMeritB(key, value) {
    if (
      key === Constants.CapabilityTargetACMode1
      || key === Constants.CapabilityTargetACMode2
      || key === Constants.CapabilityTargetACMode3
    ) {
      const valueMeritB = await this.getCapabilityValue(
        Constants.CapabilityTargetMeritB,
      ).catch(error => logError(this, error));
      const isValidMeritB = ValidityChecks.checkSupportedMeritForMode(
        this,
        Constants.CapabilityTargetMeritB,
        valueMeritB,
        value,
        disabledMeritBForMode,
      ).valid;
      if (!isValidMeritB) {
        await this.setCapabilityValue(
          Constants.CapabilityTargetMeritA,
          Constants.MeritB_Off,
        ).catch(error => logError(this, error));
      }
    }
  }

  async setStatusCapability() {
    if (this.hasCapability(Constants.CapabilityStatus)) {
      let value = this.getCapabilityValue(acMode);
      if (!this.getCapabilityValue(Constants.CapabilityOnOff)) {
        value = Constants.StatusOff;
      } else if (this.getCapabilityValue(Constants.CapabilitySelfCleaning)) {
        value = Constants.StatusCleaning;
      }
      await this.setCapabilityValue(Constants.CapabilityStatus, value).catch(error => logError(this, error));
    }
  }

  async updateStateAfterUpdateCapability() {
    const state = await StateUtils.convertCapabilitiesToState(this).catch(error => logError(this, error));
    await this.setStoreValue(Constants.StoredValueState, state).catch(error => logError(this, error));

    this.driver.amqpAPI.sendMessage(state, this.getData().DeviceUniqueID);
  }

  async setEnergyIntervalTimer() {
    this.interval = 300;
    this.timerId = null;

    const hasEnergyCapability = this.hasCapability(Constants.CapabilityEnergyConsumptionLastHour);

    if (hasEnergyCapability) {
      const { energyConsumption } = this.driver;
      this.timerId = this.homey.setInterval(async () => {
        const timezone = this.homey.clock.getTimezone();
        const dateTime = DateTime.local().setZone(timezone, {
          keepLocalTime: true,
        });

        const value = await energyConsumption.getEnergyConsumptionPerDay(
          this,
          dateTime,
        ).catch(error => logError(this, error));

        this.setCapabilityValue(
          Constants.CapabilityEnergyConsumptionToday,
          value.totalDay,
        );
        this.setCapabilityValue(
          Constants.CapabilityEnergyConsumptionLastHour,
          value.lastHour,
        );
      }, this.interval * 1000);
    }
  }

  startTrigger(key, oldValue, newValue) {
    // when installing the device, oldValue=null => do not start trigger
    if (oldValue !== null && capabilitiesInFlow.find(cap => cap === key)) {
      const triggerName = this.getTriggerName(key);
      const trigger = this.homey.flow.getDeviceTriggerCard(triggerName);
      if (trigger) {
        const token = {
          oldValue,
          newValue,
        };
        trigger.trigger(this, token);
      }
    }
  }

  updateStateAfterHeartBeat(insideTemperature, outsideTemperature) {
    StateUtils.setOutsideTemperature(this, outsideTemperature);
    StateUtils.setInsideTemperature(this, insideTemperature);
  }

  updateState(state) {
    const currentState = this.getStoreValue(Constants.StoredValueState);
    if (currentState !== state) {
      this.setStoreValue(Constants.StoredValueState, state);
      StateUtils.convertStateToCapabilities(this, state);
    }
  }

  getResult(results, query) {
    // filter based on the query
    return results.filter(result => {
      return result.name.toLowerCase().includes(query.toLowerCase());
    });
  }

  getTriggerName(key) {
    let value = key;
    if (key.includes(Constants.StoredCapabilityTargetACMode) || key.includes(Constants.StoredCapabilityTargetSwingMode)) {
      value = key.substring(0, key.length - 1);
    }
    return value;
  }

}
module.exports = ACDevice;
