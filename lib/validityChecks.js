const Constants = require('./constants');
const Features = require('./acFeatures');

function checkSupportedMerit(device, key, value, allowedValues) {
  const possibleValues = device.getStoreValue(allowedValues);
  const isValid = possibleValues.includes(value);
  let message = '';
  if (!isValid) {
    const merit = key === Constants.CapabilityTargetMeritA ? 'A' : 'B';
    message = device.homey.__('errorMeritNotSupported', { merit });
  }
  return { valid: isValid, errormessage: message };
}

function checkSingleCapabilityValue(device, capabilityValues) {
  let isValid = { valid: true, errormessage: '' };
  for (const [key, value] of Object.entries(capabilityValues)) {
    switch (key) {
      case Constants.CapabilityTargetMeritA: isValid = checkSupportedMerit(device, key, value, Constants.StoredValuesMeritA);
        break;
      case Constants.CapabilityTargetMeritB: isValid = checkSupportedMerit(device, key, value, Constants.StoredValuesMeritB);
        break;
      default: return isValid;
    }
  }
  return isValid;
}

function checkSupportedMeritForMode(device, key, value, mode, disabledValues) {
  const disabledForMode = disabledValues.find(element => element.mode === mode).disabled;
  let errorMessage = '';
  const isValid = !disabledForMode.includes(value);
  if (!isValid) {
    const merit = key === Constants.CapabilityTargetMeritA ? 'A' : 'B';
    errorMessage = device.homey.__('errorMeritNotSupportedInMode', { merit, mode });
  }
  return { valid: isValid, errormessage: errorMessage };
}

function checkIsCorrectTemperature(device, key, value) {
  let errorMessage = '';
  const capability = device.getStoreValue(Constants.StoredCapabilityTargetACMode);
  const mode = device.getCapabilityValue(capability);
  const isValid = (mode === Constants.Heat || value >= Constants.MinTemperatureNot8C);
  if (!isValid) {
    errorMessage = device.homey.__('errorTemperatureNotSupportedInMode');
  }

  return { valid: isValid, errormessage: errorMessage };
}

function checkIsCorrectTemperatureForMode(device, key, value) {
  let errorMessage = '';
  const temperature = device.getCapabilityValue(Constants.CapabilityTargetTemperatureInside);
  const isValid = (value === Constants.Heat || temperature >= Constants.MinTemperatureNot8C);
  if (!isValid) {
    errorMessage = device.homey.__('errorTemperatureNotSupportedInMode');
  }
  return { valid: isValid, errormessage: errorMessage };
}

function checkRelatedCapabilityValue(device, capabilityValues) {
  let isValid = { valid: true, errormessage: '' };
  const capability = device.getStoreValue(Constants.StoredCapabilityTargetACMode);
  const mode = device.getCapabilityValue(capability);

  for (const [key, value] of Object.entries(capabilityValues)) {
    switch (key) {
      case Constants.CapabilityTargetMeritA: isValid = checkSupportedMeritForMode(device, key, value, mode, Features.disabledMeritAForMode);
        break;
      case Constants.CapabilityTargetMeritB: isValid = checkSupportedMeritForMode(device, key, value, mode, Features.disabledMeritBForMode);
        break;
      case Constants.CapabilityTargetTemperatureInside: isValid = checkIsCorrectTemperature(device, key, value);
        break;
      case Constants.CapabilityTargetACMode1 || Constants.CapabilityTargetACMode2 || Constants.CapabilityTargetACMode3: isValid = checkIsCorrectTemperatureForMode(device, key, value);
        break;
      default: return isValid;
    }
  }
  return isValid;
}

exports.isValid = (device, capabilityValues) => {
  let valid = checkSingleCapabilityValue(device, capabilityValues);
  if (valid.valid) {
    valid = checkRelatedCapabilityValue(device, capabilityValues);
  }
  return valid;
};

module.exports.checkSupportedMeritForMode = checkSupportedMeritForMode;
