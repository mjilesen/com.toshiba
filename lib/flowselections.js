const Constants = require('./constants');
const Features = require('./ToshibaACFeatures');

exports.getModeResult = function(device, isAutocomplete) {
  const capability = device.getStoreValue(Constants.StoredCapabilityTargetACMode);
  const acModes = Features.acModes.find(element => element.capability === capability);
  if (isAutocomplete) {
    return transformToAutocomplete(acModes.modes);
  }
  return acModes;
};

exports.getMeritAResult = function(device, acMode) {
  const disabledValues = Features.disabledMeritAForMode.find(element => element.mode === acMode);
  const possibleValues = device.getStoreValue(Constants.StoredValuesMeritA).filter(element => !disabledValues.disabled.includes(element));
  return transformToAutocomplete(possibleValues);
};

exports.getMeritBResult = function(device, acMode) {
  const disabledValues = Features.disabledMeritBForMode.find(element => element.mode === acMode);
  const possibleValues = device.getStoreValue(Constants.StoredValuesMeritB).filter(element => !disabledValues.disabled.includes(element));
  return transformToAutocomplete(possibleValues);
};

function transformToAutocomplete(values) {
  const results = [];
  values.forEach((item, index) => {
    results.push({ id: item, name: item });
  });
  return results;
}

exports.getSwingModeResult = function(device, isAutocomplete) {
  const capability = device.getStoreValue(Constants.StoredCapabilityTargetSwingMode);
  const swingModes = Features.swingModes.find(element => element.capability === capability);
  if (isAutocomplete) {
    return transformToAutocomplete(swingModes.modes);
  }
  return swingModes;
};

exports.getPowerModeResult = function() {
  return transformToAutocomplete(Features.powerModes);
};

exports.getFanModeResult = function() {
  return transformToAutocomplete(Features.fanModes);
};
