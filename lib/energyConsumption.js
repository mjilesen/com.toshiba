const { SimpleClass } = require('homey');
const { logError } = require('./acFeatures');
const { DateTime } = require('luxon');
const Constants = require('./constants');

module.exports = class EnergyConsumption extends SimpleClass {

  constructor(Driver) {
    super();
    this.driver = Driver;
    this.timeZone = Driver.homey.clock.getTimezone();
  }

  async getNextEnergyConsumption(device, date) {
    const energy = await this.getEnergyConsumption(device, date).catch(error => logError(device, error));
    if (!energy) return null;
  
    const previousHour = await device.getStoreValue( Constants.StoredEnergyPreviousHour );
    const previousHourEnergy = await device.getStoreValue( Constants.StoredEnergyPreviousHourEnergy );
    const hour = this.getHour( date );
    let addedEnergy = 0;
    const newEnergy = this.getEnergy( energy, hour );
    
    if ( previousHour && hour != previousHour ){
      let energyPrevious = 0;

      if( hour === 0){
        //check previous day
        const yesterday = date.minus( {days:1})
        const energyPreviousDay = await this.getEnergyConsumption(device, yesterday).catch(error => logError(device, error));
        if (!energyPreviousDay) return null;

        energyPrevious = this.getEnergy( energyPreviousDay, 23 );
      }
      else{
        // add remaining from previous hour
        energyPrevious = this.getEnergy( energy, hour-1 );
      }   
      addedEnergy =  energyPrevious - ( previousHourEnergy?previousHourEnergy:0 ) + newEnergy ;
    }
    else{
      addedEnergy = newEnergy - ( previousHourEnergy?previousHourEnergy:0 );
    }
    
    if( newEnergy !== 0 ){
      device.setStoreValue( Constants.StoredEnergyPreviousHourEnergy, newEnergy );   
      device.setStoreValue( Constants.StoredEnergyPreviousHour, hour );
    }
  
    return { addedEnergy, hour, lastHour: newEnergy };
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

  getHour(date){
      const hour = date.hour;
      const offset = date.offset / 60;
      
      let hourTZ = hour + offset;
      if( hourTZ >= 24 ){
        hourTZ = hourTZ - 24;
      }
      if ( hourTZ < 0 ){
        hourTZ = 24 + offset;
      }

      return hourTZ;
  }

  getEnergy( energy, hour){
    return energy[hour].Energy / 1000
  };

  sumEnergyConsumption(energy) {
    return energy.reduce(
      (previousValue, currentValue) => previousValue + currentValue.Energy,
      0,
    );
  }

};
