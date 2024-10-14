'use strict';

const { MeritA_CDU_Silent_1 } = require("../../lib/constants");

module.exports = {
  async getACValues({ homey, query }) {
      const devices = homey.drivers.getDriver('ac').getDevices();
      const device = devices.find(obj => {
         return obj.getData().DeviceUniqueID === query.deviceUniqueId;
       });
      const onoff = device.getCapabilityValue("onoff");
      const acMode1 = device.getCapabilityValue("target_ac_mode1")
      const acMode2 = device.getCapabilityValue("target_ac_mode2")
      const acMode3 = device.getCapabilityValue("target_ac_mode3")
      
      let acMode = acMode1;
      if( acMode2 != null ){
        acMode = acMode2
      }
      else if ( acMode3 != null ){
        acMode = acMode3
      }
     
      const targetTemperature = device.getCapabilityValue("target_temperature")
      const measureTemperature = device.getCapabilityValue("measure_temperature")
    
    return { onoff, acMode, targetTemperature, measureTemperature };
  }
};
