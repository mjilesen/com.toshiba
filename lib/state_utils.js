'use strict';

const Constants = require('./constants');
const Selections = require('./flowselections');

// Convert a hex string to a byte array
function hexToBytes(hex) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(byteArray) {
  return byteArray.reduce((output, elem) => (output + (`0${elem.toString(16)}`).slice(-2)), '');
}

function convertStateToBytes(state) {
  // Merit A/B features are encoded using half bytes but our unpacking expect them as bytes
  const extendedState = `${state.substring(0, 12)}0${state.substring(12, 13)}0${state.substring(13)}`;
  return hexToBytes(extendedState);
}

function convertBytesToState(bytes) {
  const newState = bytesToHex(bytes);
  /// / Merit A/B features are using half bytes
  return (newState.slice(0, 12) + newState.substring(13, 14) + newState.slice(15));
}

function setOnOffToRaw(device) {
  const onOff = device.getCapabilityValue(Constants.CapabilityOnOff);
  let raw = Constants.NONE_VAL;
  switch (onOff) {
    case true: raw = 0x30;
      break;
    case false: raw = 0x31;
      break;
    default: break;
  }
  return raw;
}

function setOnOfFromRaw(device, raw) {
  let status = false;
  switch (raw) {
    case 0x30: status = Constants.ON;
      break;
    case 0x31: status = Constants.OFF;
      break;
    default: return;
  }
  device.setCapabilityValue(Constants.CapabilityOnOff, status).catch(device.error);
}

function setTargetTemperatureFromRaw(device, raw) {
  if (raw !== Constants.NONE_VAL) {
    device.setCapabilityValue(Constants.CapabilityTargetTemperatureInside, raw).catch(device.error);
  }
}

function setTargetTemperatureToRaw(device) {
  const targetTemperature = device.getCapabilityValue(Constants.CapabilityTargetTemperatureInside);
  return targetTemperature.toString(16);
}

function setModeFromRaw(device, raw) {
  if (raw !== Constants.NONE_VAL) {
    let status = '';
    switch (raw) {
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
    const allowedValues = Selections.getModeResult(device, false);
    if (allowedValues.modes.find(element => element === status)) {
      const capability = device.getStoreValue(Constants.StoredCapabilityTargetACMode);
      device.setCapabilityValue(capability, status).catch(device.error);
    }
  }
}

function setModeToRaw(device) {
  const capability = device.getStoreValue(Constants.StoredCapabilityTargetACMode);
  const targetAcMode = device.getCapabilityValue(capability);
  let raw = Constants.NONE_VAL;
  switch (targetAcMode) {
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
    default: break;
  }
  return raw;
}

function setFanModeFromRaw(device, raw) {
  if (raw !== Constants.NONE_VAL) {
    let status = '';
    switch (raw) {
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
    device.setCapabilityValue(Constants.CapabilityTargetFanMode, status).catch(device.error);
  }
}

function setFanModeToRaw(device) {
  const targetFanMode = device.getCapabilityValue(Constants.CapabilityTargetFanMode);
  let raw = Constants.NONE_VAL;
  switch (targetFanMode) {
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
    default: break;
  }
  return raw;
}

function setSwingModeFromRaw(device, raw) {
  if (raw !== Constants.NONE_VAL) {
    let status = '';
    switch (raw) {
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
    const allowedValues = Selections.getSwingModeResult(device, false);
    if (allowedValues.modes.find(element => element === status)) {
      const cap = device.getStoreValue(Constants.StoredCapabilityTargetSwingMode);
      device.setCapabilityValue(cap, status).catch(device.error);
    }
  }
}

function setSwingModeToRaw(device) {
  const cap = device.getStoreValue(Constants.StoredCapabilityTargetSwingMode);
  const targetSwingMode = device.getCapabilityValue(cap);

  let raw = Constants.NONE_VAL;
  switch (targetSwingMode) {
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
    case Constants.SwingMode_Fixed_2: raw = 0x51;
      break;
    case Constants.SwingMode_Fixed_3: raw = 0x52;
      break;
    case Constants.SwingMode_Fixed_4: raw = 0x53;
      break;
    case Constants.SwingMode_Fixed_5: raw = 0x54;
      break;
    default: break;
  }
  return raw;
}

function setPowerSelectionFromRaw(device, raw) {
  if (raw !== Constants.NONE_VAL) {
    let status = Constants.PowerSelection_power_none;
    switch (raw) {
      case 0x32: status = Constants.PowerSelection_power_50;
        break;
      case 0x4B: status = Constants.PowerSelection_power_75;
        break;
      case 0x64: status = Constants.PowerSelection_power_100;
        break;
      default: return;
    }
    device.setCapabilityValue(Constants.CapabilityTargetPowerMode, status).catch(device.error);
  }
}

function setPowerSelectionToRaw(device) {
  const targetPowerMode = device.getCapabilityValue(Constants.CapabilityTargetPowerMode);
  let raw = Constants.NONE_VAL;
  switch (targetPowerMode) {
    case Constants.PowerSelection_power_50: raw = 0x32;
      break;
    case Constants.PowerSelection_power_75: raw = 0x4B;
      break;
    case Constants.PowerSelection_power_100: raw = 0x64;
      break;
    case Constants.PowerSelection_power_none: raw = Constants.NONE_VAL;
    default: break;
  }
  return raw;
}

function setMeritAFromRaw(device, raw) {
  if (raw !== Constants.NONE_VAL_HALF_BYTE) {
    let status = Constants.MeritA_Off;
    switch (raw) {
      case 0x01: status = Constants.MeritA_High_Power;
        break;
      case 0x02: status = Constants.MeritA_CDU_Silent_1;
        break;
      case 0x03: status = Constants.MeritA_Eco;
        break;
      case 0x04: status = Constants.MeritA_Heating_8C;
        break;
      case 0x05: status = Constants.MeritA_Sleep_Care;
        break;
      case 0x06: status = Constants.MeritA_Floor;
        break;
      case 0x07: status = Constants.MeritA_Comfort;
        break;
      case 0x0A: status = Constants.MeritA_CDU_Silent_2;
        break;
      case 0x00: status = Constants.MeritA_Off;
        break;
      default: return;
    }
    device.setCapabilityValue(Constants.CapabilityTargetMeritA, status).catch(device.error);
  }
}

function setMeritAToRaw(device) {
  const targetMeritA = device.getCapabilityValue(Constants.CapabilityTargetMeritA);
  let raw = Constants.NONE_VAL;
  switch (targetMeritA) {
    case Constants.MeritA_High_Power: raw = 0x01;
      break;
    case Constants.MeritA_CDU_Silent_1: raw = 0x02;
      break;
    case Constants.MeritA_Eco: raw = 0x03;
      break;
    case Constants.MeritA_Heating_8C: raw = 0x04;
      break;
    case Constants.MeritA_Sleep_Care: raw = 0x05;
      break;
    case Constants.MeritA_Floor: raw = 0x06;
      break;
    case Constants.MeritA_Comfort: raw = 0x07;
      break;
    case Constants.MeritA_CDU_Silent_2: raw = 0x0A;
      break;
    case Constants.MeritA_Off: raw = 0x00;
      break;
    default: break;
  }
  return raw;
}

function setMeritBFromRaw(device, raw) {
  if (device.hasCapability(Constants.CapabilityTargetMeritB)) {
    if (raw !== Constants.NONE_VAL_HALF_BYTE) {
      let status = Constants.MeritB_Off;
      switch (raw) {
        case 0x02: status = Constants.MeritB_Fire_Place_1;
          break;
        case 0x03: status = Constants.MeritB_Fire_Place_2;
          break;
        case 0x00: status = Constants.MeritB_Off;
          break;
        default: return;
      }
      device.setCapabilityValue(Constants.CapabilityTargetMeritB, status).catch(device.error);
    }
  }
}

function setMeritBToRaw(device) {
  let raw = Constants.NONE_VAL;
  if (device.hasCapability(Constants.CapabilityTargetMeritB)) {
    const targetMeritB = device.getCapabilityValue(Constants.CapabilityTargetMeritB);
    switch (targetMeritB) {
      case Constants.MeritB_Fire_Place_1: raw = 0x02;
        break;
      case Constants.MeritB_Fire_Place_2: raw = 0x03;
        break;
      case Constants.MeritB_Off: raw = 0x00;
        break;
      default: break;
    }
  }
  return raw;
}

function setAirPureIonFromRaw(device, raw) {
  if (device.hasCapability(Constants.CapabilityAirPureIon)) {
    if (raw !== Constants.NONE_VAL) {
      let status = false;
      switch (raw) {
        case 0x18: status = true;
          break;
        case 0x10: status = false;
          break;
        default: return;
      }
      device.setCapabilityValue(Constants.CapabilityAirPureIon, status).catch(device.error);
    }
  }
}

function setAirPureIonToRaw(device) {
  let raw = Constants.NONE_VAL;
  if (device.hasCapability(Constants.CapabilityAirPureIon)) {
    const targetAirPureIon = device.getCapabilityValue(Constants.CapabilityAirPureIon);
    switch (targetAirPureIon) {
      case true: raw = 0x18;
        break;
      case false: raw = 0x10;
        break;
      default: break;
    }
  }
  return raw;
}

function setSelfCleaningFromRaw(device, raw) {
  if (device.hasCapability(Constants.CapabilitySelfCleaning)) {
    let status = false;
    switch (raw) {
      case Constants.NONE_VAL: status = false;
        break;
      case 0x18: status = true;
        break;
      case 0x10: status = false;
        break;
      default: return;
    }
    device.setCapabilityValue(Constants.CapabilitySelfCleaning, status).catch(device.error);
  }
}

function setSelfCleaningToRaw(device) {
  const targetSelfCleaning = device.getCapabilityValue(Constants.CapabilitySelfCleaning);
  let raw = Constants.NONE_VAL;
  switch (targetSelfCleaning) {
    case true: raw = 0x18;
      break;
    case false: raw = 0x10;
      break;
    default: break;
  }
  return raw;
}

function setOutsideTemperatureFromRaw(device, value) {
  if (value < 255) {
    device.setCapabilityValue(Constants.CapabilityMeasureTemperaturOutside, value).catch(device.error);
  }
}

function setInsideTemperatureFromRaw(device, value) {
  if (value < 255) {
    device.setCapabilityValue(Constants.CapabilityMeasureTemperatureInside, value).catch(device.error);
  }
}

exports.setInsideTemperature = (device, value) => {
  setInsideTemperatureFromRaw(device, value);
};

exports.setOutsideTemperature = (device, value) => {
  setOutsideTemperatureFromRaw(device, value);
};

exports.convertStateToCapabilities = (device, state) => {
  const bytes = convertStateToBytes(state);
  setOnOfFromRaw(device, bytes[Constants.PositionByteOnOff]);
  setModeFromRaw(device, bytes[Constants.PositionByteMode]);
  setTargetTemperatureFromRaw(device, bytes[Constants.PostionByteTargetTemperature]);
  setFanModeFromRaw(device, bytes[Constants.PostionByteFanMode]);
  setSwingModeFromRaw(device, bytes[Constants.PositionByteSwingMode]);
  setPowerSelectionFromRaw(device, bytes[Constants.PostionBytePowerSelection]);
  setMeritAFromRaw(device, bytes[Constants.PostionByteMeritA]);
  setMeritBFromRaw(device, bytes[Constants.PostionByteMeritB]);
  setAirPureIonFromRaw(device, bytes[Constants.PostionByteAirPureIon]);
  setSelfCleaningFromRaw(device, bytes[Constants.PostionByteSelfCleaning]);
  setInsideTemperatureFromRaw(device, bytes[Constants.PositionByteInsideTemperature]);
  setOutsideTemperatureFromRaw(device, bytes[Constants.PositionByteOutsideTemperature]);
};

exports.convertCapabilitiesToState = device => {
  const bytes = convertStateToBytes(device.getStoreValue(Constants.StoredValueState));
  bytes[Constants.PositionByteOnOff] = setOnOffToRaw(device);
  bytes[Constants.PositionByteMode] = setModeToRaw(device);
  bytes[Constants.PostionByteTargetTemperature] = setTargetTemperatureToRaw(device);
  bytes[Constants.PostionByteFanMode] = setFanModeToRaw(device);
  bytes[Constants.PositionByteSwingMode] = setSwingModeToRaw(device);
  bytes[Constants.PostionBytePowerSelection] = setPowerSelectionToRaw(device);
  bytes[Constants.PostionByteMeritA] = setMeritAToRaw(device);
  bytes[Constants.PostionByteMeritB] = setMeritBToRaw(device);
  bytes[Constants.PostionByteAirPureIon] = setAirPureIonToRaw(device);
  bytes[Constants.PostionByteSelfCleaning] = setSelfCleaningToRaw(device);
  return convertBytesToState(bytes);
};
