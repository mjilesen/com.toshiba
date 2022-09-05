const { SimpleClass } = require("homey");

module.exports = class EnergyConsumption extends SimpleClass {
  constructor(Driver) {
    super();
    this.driver = Driver;
    this.timeZone = Driver.homey.clock.getTimezone();
  }

  async getEnergyConsumptionPerDay(deviceUniqueID, date) {
    const energy = await this.getEnergyConsumption(deviceUniqueID, date);
    if (!energy) return { lastHour: 0, totalDay: 0 };

    const lastHour = energy[date.hour].Energy;
    const totalDay = await this.getEnergyConsumptionCurrentDay(
      deviceUniqueID,
      date,
      energy
    );
    return { lastHour, totalDay };
  }

  async getEnergyConsumption(deviceUniqueID, date) {
    const result = await this.driver.httpAPI.getEnergyConsumption(
      [deviceUniqueID],
      "EnergyDay",
      date,
      date
    );
    return result.find((element) => element.ACDeviceUniqueId === deviceUniqueID)
      .EnergyConsumption;
  }

  async getEnergyConsumptionCurrentDay(deviceUniqueID, date, energy) {
    let endIndex = date.hour; // UTC format
    const startTimeUTC = date
      .setZone(this.timeZone)
      .startOf("day")
      .setZone("utc");

    let startIndex = 0;
    if (startTimeUTC.day === date.day) {
      startIndex = startTimeUTC.hour;
    }
    let totalDay = await this.sumEnergyConsumption(
      energy,
      startIndex,
      endIndex
    );

    if (startTimeUTC.day !== date.day) {
      // add values from previous (UTC) day to get the full day for the current timezone...
      const energy = await this.getEnergyConsumption(
        deviceUniqueID,
        startTimeUTC
      );
      endIndex = 23;
      startIndex = startTimeUTC.hour;
      totalDay += this.sumEnergyConsumption(energy, startIndex, endIndex);
    }
    return totalDay;
  }

  sumEnergyConsumption(energy, startIndex, endIndex) {
    return energy
      .slice(startIndex, endIndex + 1)
      .reduce(
        (previousValue, currentValue) => previousValue + currentValue.Energy,
        0
      );
  }
};
