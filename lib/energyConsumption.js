const { SimpleClass } = require('homey');
const Constants = require('./constants');
const { DateTime } = require("luxon");

module.exports = class EnergyConsumption extends SimpleClass {
  constructor(Driver) {
    super();
    this.driver = Driver;
    this.timeZone = Driver.homey.clock.getTimezone();
  }

  async getEnergyConsumptionPerDay( deviceUniqueID, date ){
    //Homey is always in UTC, but here we need the local date to get the correct result!
    const convdate = date.setZone( this.timeZone );
    const startUTC = convdate.toFormat('yyyy-MM-dd ');
    const endUTC = convdate.plus({days:1}).toFormat('yyyy-MM-dd');
    const result = await this.driver.httpAPI.getEnergyConsumption( [deviceUniqueID], "EnergyDay", startUTC, endUTC )

    const energy = this.getEnergyConsumption(deviceUniqueID, result);
    if ( !energy) return 0;
    const lastDay = energy.reduce( ( previousValue, currentValue ) => previousValue + currentValue.Energy,0);
    const lastHour = energy[convdate.hour-1].Energy
    return {lastHour: lastHour, lastDay:lastDay};
  }

  getEnergyConsumption( deviceUniqueID, result){
    return result.find( element => element.ACDeviceUniqueId = deviceUniqueID ).EnergyConsumption
  }
}
