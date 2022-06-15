const Constants = require("./constants");

exports.convertStateToCapabilities = function( device, state ){
  const bytes = convertStateToBytes( state );
  setOnOfFromRaw( device, bytes[Constants.PositionByteOnOff] );
  setModeFromRaw( device, bytes[Constants.PositionByteMode] );
  setTargetTemperature( device, bytes[Constants.PostionByteTargetTemperature]);
  setFanMode( device, bytes[Constants.PostionByByteFanMode] );
  setSwingMode( device, bytes[Constants.PositionByteSwingMode] );
  setPowerSelection( device, bytes[Constants.PostionsBytePowerSelection]);
  setInsideTemperature( device, bytes[Constants.PositionsByByteInsideTemperature] );
  setOutsideTemperature( device, bytes[Constants.PositionsByByteOutsideTemperature]);
}

exports.convertCapabilitiesToState = function( device ){
  let bytes = convertStateToBytes( device.getStoreValue( "state") )
  bytes[Constants.PositionByteOnOff] = setOnOffToRaw( device );
  bytes[Constants.PositionByteMode] = setModeToRaw( device );
  bytes[Constants.PostionByteTargetTemperature] = setTargetTemperatureToRaw( device );
  //bytes[3] = setFanModeToRaw( device );
  //bytes[4] = setSwingModeToRaw( device );
  //btes[5] = setPowerSelectionToRaw( device );

  return convertBytesToState( bytes );
}

function convertStateToBytes( state ){
  // Merit A/B features are encoded using half bytes but our unpacking expect them as bytes
  const extended_state = state.substring(0,12) + "0" + state.substring( 12, 13) + "0" + state.substring( 13 )
  return hexToBytes( extended_state )
}

function convertBytesToState( bytes ){
  let new_state = bytesToHex( bytes )
  //// Merit A/B features are using half bytes
  return ( new_state.slice( 0, 12 ) + new_state.substring( 13,14 ) + new_state.slice( 15) );
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
  let onoff = device.getCapabilityValue( Constants.CapabilityOnOff )
  switch( onoff ){
    case true: status = 0x30;
    break;
    case false: status = 0x31;
    break;
  }
  return status;
}

function setOnOfFromRaw( device, raw ){
  let status = "";
  switch ( raw ){
    case 0x30: status = Constants.ON;
    break;
    case 0x31: status = Constants.OFF;
    break;
    default: return;
  }
  device.setCapabilityValue(Constants.CapabilityOnOff, status).catch(this.error);
}

function setTargetTemperature( device, raw){
  if ( raw != "ff"){
    device.setCapabilityValue(Constants.CapabilityTargetTemperatureInside, raw).catch(this.error);
  }
}

function setTargetTemperatureToRaw( device){
  let target_temperature = device.getCapabilityValue( Constants.CapabilityTargetTemperatureInside )
  return target_temperature.toString( 16 );
}

function setModeFromRaw( device, raw ){
  let status = "";
  switch ( raw ){
    case 0x41: status = Constants.Auto;
    break;
    case 0x42: status = Constants.Cool;
    break;
    case 0x43: status = Constants.Heat;
    break;
    case 0x44: status = Constants.Dry;
    break;
    case 0x45: status = Constants.Fan;
    break;
    default: return;
  }

  device.setCapabilityValue('measured_ac_mode', status).catch(this.error);
  device.setCapabilityValue(Constants.CapabilityTargetACMode, status).catch(this.error);
}

function setModeToRaw( device){
  let target_ac_mode = device.getCapabilityValue( Constants.CapabilityTargetACMode )
  switch( target_ac_mode ){
    case Constants.Auto: target_ac_mode = 0x41;
    break;
    case Constants.Cool: target_ac_mode = 0x42;
    break;
    case Constants.Heat: target_ac_mode = 0x43;
    break;
    case Constants.Dry: target_ac_mode = 0x44;
    break;
    case Constants.Fan: target_ac_mode = 0x45;
    break;
  }
  return target_ac_mode;
}

function setFanMode( device, raw ){
  let status = "";
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
    default: return;
  }

  device.setCapabilityValue('measured_fan_mode', status).catch(this.error);
  device.setCapabilityValue('target_fan_mode', status).catch(this.error);
}

function setSwingMode( device, raw ){
  let status = "";
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
    default: return;
  }

  device.setCapabilityValue('measured_swing_mode', status).catch(this.error);
}

function setPowerSelection(device, raw ){
  let status = "";
  switch ( raw ){
    case 0x32: status = Constants.PowerSelection_power_50;
    break;
    case 0x48: status = Constants.PowerSelection_power_75;
    break;
    case 0x64: status = Constants.PowerSelection_power_100;
    break;
    default: return;
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
