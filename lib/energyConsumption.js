const { SimpleClass } = require('homey');

module.exports = class EnergyConsumption extends SimpleClass {

  constructor(Driver) {
    super();
    this.driver = Driver;
    this.timeZone = Driver.homey.clock.getTimezone();
  }

  async getEnergyConsumptionPerDay(deviceUniqueID, date) {
    const energy = await this.getEnergyConsumption(deviceUniqueID, date);
    if (!energy) return { lastHour: 0, totalDay: 0 };

    const lastHour = Math.round(energy[date.hour].Energy / 10) / 100;
    const totalDay = Math.round(this.sumEnergyConsumption(energy) / 10) / 100;

    return { lastHour, totalDay };
  }

  async getEnergyConsumption(deviceUniqueID, date) {
    const start = date.startOf('day').setZone('UTC');
    const end = start.plus({ hours: 23, minutes: 59, seconds: 59 });
    const timezone = date.offsetNameLong;

    const result = await this.driver.httpAPI.getEnergyConsumption(
      [deviceUniqueID],
      'EnergyDay',
      start,
      end,
      timezone,
    );
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
