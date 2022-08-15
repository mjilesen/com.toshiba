const { SimpleClass } = require('homey');
const Constants = require('./constants');
const dayjs = require( 'dayjs');
//const utc = require('dayjs/plugin/utc');

module.exports = class EnergyConsumption extends SimpleClass {
  constructor(Driver) {
    super();
    this.driver = Driver;
    //dayjs.extend( utc );
  }

  async getEnergyConsumptionPerDay( deviceUniqueID, date ){
    const startUTC = date.toJSON();
    const endUTC = date.add( 1, 'day').toJSON();
    console.log( "start and end", date, startUTC, endUTC );
    const result = await this.driver.httpAPI.getEnergyConsumption( [deviceUniqueID], "EnergyDay", startUTC, endUTC )
  }
}
