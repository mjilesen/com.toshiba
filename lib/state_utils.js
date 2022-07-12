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
  let bytes = convertStateToBytes( device.getStoreValue( Constants.StoredValueState ) )
  bytes[Constants.PositionByteOnOff] = setOnOffToRaw( device );
  bytes[Constants.PositionByteMode] = setModeToRaw( device );
  bytes[Constants.PostionByteTargetTemperature] = setTargetTemperatureToRaw( device );
  bytes[Constants.PostionByByteFanMode] = setFanModeToRaw( device );
  bytes[Constants.PositionByteSwingMode] = setSwingModeToRaw( device );
  bytes[Constants.PostionsBytePowerSelection] = setPowerSelectionToRaw( device );
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
  let raw = Constants.NONE_VAL;
  switch( onoff ){
    case true: raw = 0x30;
    break;
    case false: raw = 0x31;
    break;
  }
  return raw;
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
  if ( raw != Constants.NONE_VAL){
    device.setCapabilityValue(Constants.CapabilityTargetTemperatureInside, raw).catch(this.error);
  }
}

function setTargetTemperatureToRaw( device){
  let target_temperature = device.getCapabilityValue( Constants.CapabilityTargetTemperatureInside )
  return target_temperature.toString( 16 );
}

function setModeFromRaw( device, raw ){
  if ( raw != Constants.NONE_VAL ){
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
    const capability = device.getStoreValue( Constants.StoredCapabilityTargetACMode )
    device.setCapabilityValue( capability, status).catch(this.error);
  }
}

function setModeToRaw( device){
  const capability = device.getStoreValue( Constants.StoredCapabilityTargetACMode )
  const target_ac_mode = device.getCapabilityValue( capability )
  let raw = Constants.NONE_VAL;
  switch( target_ac_mode ){
    case Constants.Auto: raw = 0x41;
    break;
    case Constants.Cool: raw = 0x42;
    break;
    case Constants.Heat: raw = 0x43;
    break;
    case Constants.Dry: raw = 0x44;
    break;
    case Constants.Fan: raw = 0x45;
    break;
  }
  return raw;
}

function setFanMode( device, raw ){
  if ( raw != Constants.NONE_VAL ){
    let status = "";
    switch ( raw ){
      case 0x41: status = Constants.FanMode_Auto;
      break;
      case 0x31: status = Constants.FanMode_Quiet;
      break;
      case 0x32: status = Constants.FanMode_Low;
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
    device.setCapabilityValue(Constants.CapabilityTargetFanMode, status).catch(this.error);
  }
}

function setFanModeToRaw( device){
  const target_fan_mode = device.getCapabilityValue( Constants.CapabilityTargetFanMode )
  let raw = Constants.NONE_VAL;
  switch( target_fan_mode ){
    case Constants.FanMode_Auto: raw = 0x41;
    break;
    case Constants.FanMode_Quiet: raw = 0x31;
    break;
    case Constants.FanMode_Low: raw = 0x32;
    break;
    case Constants.FanMode_Medium_Low: raw = 0x33;
    break;
    case Constants.FanMode_Medium: raw = 0x34;
    break;
    case Constants.FanMode_Medium_High: raw = 0x35;
    break;
    case Constants.FanMode_High: raw = 0x36;
    break;
  }
  return raw;
}

function setSwingMode( device, raw ){
  if ( raw != Constants.NONE_VAL ){
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
   const cap = device.getStoreValue( Constants.StoredCapabilityTargetSwingMode )
   device.setCapabilityValue( cap , status).catch(this.error);
  }
}

function setSwingModeToRaw( device){
  const cap = device.getStoreValue( Constants.StoredCapabilityTargetSwingMode )
  const target_swing_mode = device.getCapabilityValue( cap )

  let raw = Constants.NONE_VAL;
  switch( target_swing_mode ){
    case Constants.SwingMode_Off: raw = 0x31;
    break;
    case Constants.SwingMode_SwingVertical: raw = 0x41;
    break;
    case Constants.SwingMode_SwingHorizontal: raw = 0x42;
    break;
    case Constants.SwingMode_SwingVerticalAndHorizontal: raw = 0x43;
    break;
    case Constants.SwingMode_Fixed_1: raw = 0x50;
    break;
    case Constants.SwingMode_Fixed_1: raw = 0x51;
    break;
    case Constants.SwingMode_Fixed_3: raw = 0x52;
    break;
    case Constants.SwingMode_Fixed_4: raw = 0x53;
    break;
    case Constants.SwingMode_Fixed_5: raw = 0x54;
    break;
  }
  return raw;
};

function setPowerSelection(device, raw ){
  if ( raw != Constants.NONE_VAL ){
    let status = Constants.PowerSelection_power_none;
    switch ( raw ){
      case 0x32: status = Constants.PowerSelection_power_50;
      break;
      case 0x4B: status = Constants.PowerSelection_power_75;
      break;
      case 0x64: status = Constants.PowerSelection_power_100;
      break;
    }
    device.setCapabilityValue( Constants.CapabilityTargetPowerMode, status).catch(this.error);
  }
};

function setPowerSelectionToRaw( device){
  const target_power_mode = device.getCapabilityValue( Constants.CapabilityTargetPowerMode );
  let raw = Constants.NONE_VAL;
  switch( target_power_mode ){
    case Constants.PowerSelection_power_50: raw = 0x32;
    break;
    case Constants.PowerSelection_power_75: raw = 0x4B;
    break;
    case Constants.PowerSelection_power_100: raw = 0x64;
    break;
    case Constants.PowerSelection_power_none: raw = Constants.NONE_VAL;
  }
  return raw;
}
function setOutsideTemperature( device,value){
  if ( value < 255){
    device.setCapabilityValue(Constants.CapabilityMeasureTemperaturOutside, value ).catch(this.error);
  }
};

function setInsideTemperature( device, value ){
  if ( value < 255){
    device.setCapabilityValue( Constants.CapabilityMeasureTemperatureInside, value ).catch(this.error);
  }  
};

exports.setInsideTemperature = function( device, value ){
  setInsideTemperature(device, value )
}

exports.setOutsideTemperature = function( device, value ){
  setOutsideTemperature(device, value )
}
