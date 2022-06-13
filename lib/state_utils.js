const Constants = require("./constants");

exports.convertStateToCapabilities = function( device, hex_state ){
  // Merit A/B features are encoded using half bytes but our unpacking expect them as bytes
  const extended_hex_state = hex_state.substr(0,12) + "0" + hex_state.substr( 12, 1) + "0" + hex_state.substr( 13, hex_state.length - 12 - 1 )
  const bytes = hexToBytes( extended_hex_state )

  device.setStoreValue( "state", extended_hex_state )
  setOnOfFromRaw( device, bytes[0] );
  setModeFromRaw( device, bytes[1] );
  setTargetTemperature( device, bytes[2]);
  setFanMode( device, bytes[3] );
  setSwingMode( device, bytes[4] );
  setPowerSelection( device, bytes[5]);
  setInsideTemperature( device, bytes[9] );
  setOutsideTemperature( device, bytes[10]);
}

exports.convertCapabilitiesToState = function( device ){
  let state = device.getStoreValue( "state" )
  let bytes = hexToBytes( state )
  console.log( "bytes voor", state, bytes )
  bytes[0] = setOnOffToRaw( device );
  //bytes[1] = setModeToRaw( device );
  //bytes[2] = setTargetTemperatureToRaw( device );
  //bytes[3] = setFanModeToRaw( device );
  //bytes[4] = setSwingModeToRaw( device );
  //btes[5] = setPowerSelectionToRaw( device );

  console.log( "bytes", bytes )

  let new_state = bytesToHex(bytes )
  console.log("new_state", new_state)
  //// Merit A/B features are using half bytes
  return ( new_state.slice( 0, 12 ) + new_state.substr( 13,1 ) + new_state.slice( 15) );
}

// Convert a hex string to a byte array
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
  }

// Convert a byte array to a hex string
  function bytesToHex( byteArray ) {
    let value = byteArray.reduce((output, elem) =>
   (output + ('0' + elem.toString(16)).slice(-2)),
   '');

   return value
    }

function setOnOffToRaw( device){
  let onoff = device.getCapabilityValue( "onoff")
  onoff = true
  let status = 0;
  switch( onoff ){
    case true: status = 0x30;
    break;
    case false: status = 0x31;
  }
  return status;
}

function setOnOfFromRaw( device, raw ){
  let status = Constants.OFF;
  switch ( raw ){
    case 0x30: status = Constants.ON;
    break;
    case 0x31: status = Constants.OFF;
    break;
  }

  device.setCapabilityValue('onoff', status).catch(this.error);
}

function setTargetTemperature( device, raw){
  device.setCapabilityValue('target_temperature.inside', raw).catch(this.error);
}

function setModeFromRaw( device, raw ){
  let status = Constants.Off;
  switch ( raw ){
    case 0x41: status = Constants.Auto;
    break;
    case 0x42: status = Constants.Cool;
    break;
    case 0x43: status = Constants.Heat;
    break;
    case 0x44: status = Constants.Dry;
    break;
    case 0x42: status = Constants.Fan;
    break;
  }

  device.setCapabilityValue('measured_ac_mode', status).catch(this.error);
  device.setCapabilityValue('target_ac_mode', status).catch(this.error);
}

function setFanMode( device, raw ){
  let status = Constants.FanMode_None;
  switch ( raw ){
    case 0x41: status = Constants.FanMode_Auto;
    break;
    case 0x31: status = Constants.FanMode_None;
    break;
    case 0x32: status = Constants.FanMode_Quiet;
    break;
    case 0x33: status = Constants.FanMode_Medium_Low;
    break;
    case 0x34: status = Constants.FanMode_Medium;
    break;
    case 0x35: status = Constants.FanMode_Medium_High;
    break;
    case 0x36: status = Constants.FanMode_High;
    break;
  }

  device.setCapabilityValue('measured_fan_mode', status).catch(this.error);
  device.setCapabilityValue('target_fan_mode', status).catch(this.error);
}

function setSwingMode( device, raw ){
  let status = Constants.SwingMode_None;
  switch ( raw ){
    case 0x31: status = Constants.SwingMode_Off;
    break;
    case 0x41: status = Constants.SwingMode_SwingVertical;
    break;
    case 0x42: status = Constants.SwingMode_SwingHorizontal;
    break;
    case 0x43: status = Constants.SwingMode_SwingVerticalAndHorizontal;
    break;
    case 0x50: status = Constants.SwingMode_Fixed_1;
    break;
    case 0x51: status = Constants.SwingMode_Fixed_2;
    break;
    case 0x52: status = Constants.SwingMode_Fixed_3;
    break;
    case 0x53: status = Constants.SwingMode_Fixed_4;
    break;
    case 0x54: status = Constants.SwingMode_Fixed_5;
    break;
  }

  device.setCapabilityValue('measured_swing_mode', status).catch(this.error);
}

function setPowerSelection(device, raw ){
  let status = Constants.PowerSelection_power_none;
  switch ( raw ){
    case 0x32: status = Constants.PowerSelection_power_50;
    break;
    case 0x48: status = Constants.PowerSelection_power_75;
    break;
    case 0x64: status = Constants.PowerSelection_power_100;
    break;
  }

  device.setCapabilityValue('measured_power_selection', status).catch(this.error);
}

function setOutsideTemperature( device,value){
  device.setCapabilityValue('measure_temperature_outside', value ).catch(this.error);
}

function setInsideTemperature( device, value ){
  device.setCapabilityValue('measure_temperature.inside', value ).catch(this.error);
}
exports.setInsideTemperature = function( device, value ){
  setInsideTemperature(device, value )
}

exports.setOutsideTemperature = function( device, value ){
  setOutsideTemperature(device, value )
}
