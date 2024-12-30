const { SimpleClass } = require('homey');
const { logError } = require('./acFeatures');

module.exports = class EnergyConsumption extends SimpleClass {

  constructor(Driver) {
    super();
    this.driver = Driver;
    this.timeZone = Driver.homey.clock.getTimezone();
  }

  async getEnergyConsumptionPerDay(device, date) {
    const energy = await this.getEnergyConsumption(device, date).catch(error => logError(device, error));
    if (!energy) return { lastHour: 0, totalDay: 0 };

    const lastHour = Math.round(energy[date.hour].Energy / 10) / 100;
    const totalDay = Math.round(this.sumEnergyConsumption(energy) / 10) / 100;

    return { lastHour, totalDay };
  }

  async getEnergyConsumption(device, date) {
    const start = date.startOf('day').setZone('UTC');
    const end = start.plus({ hours: 23, minutes: 59, seconds: 59 });
    const timezone = date.offsetNameLong;
    const deviceUniqueID = device.getData().DeviceUniqueID;

    const result = await this.driver.httpAPI.getEnergyConsumption(
      [deviceUniqueID],
      'EnergyDay',
      start,
      end,
      timezone,
    ).catch(error => logError(device, error));
    if ( !result ) return 0;

    return result.find(element => element.ACDeviceUniqueId === deviceUniqueID)
      .EnergyConsumption;
  }

  sumEnergyConsumption(energy) {
    return energy.reduce(
      (previousValue, currentValue) => previousValue + currentValue.Energy,
      0,
    );
  }

};
