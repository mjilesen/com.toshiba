const Constants = require('./constants');

const meritA = [
  Constants.MeritA_Off,
  Constants.MeritA_Sleep_Care,
  Constants.MeritA_Comfort,
];
const meritB = [Constants.MeritB_Off];

exports.acModes = [
  {
    capability: Constants.CapabilityTargetACMode1,
    modes: [
      Constants.Auto,
      Constants.Cool,
      Constants.Heat,
      Constants.Dry,
      Constants.Fan,
    ],
  },
  { capability: Constants.CapabilityTargetACMode2, modes: [Constants.Heat] },
  {
    capability: Constants.CapabilityTargetACMode3,
    modes: [Constants.Auto, Constants.Cool, Constants.Dry, Constants.Fan],
  },
];
exports.swingModes = [
  {
    capability: Constants.CapabilityTargetSwingMode1,
    modes: [
      Constants.SwingMode_Off,
      Constants.SwingMode_SwingVertical,
      Constants.SwingMode_SwingHorizontal,
      Constants.SwingMode_SwingVerticalAndHorizontal,
      Constants.SwingMode_Fixed_1,
      Constants.SwingMode_Fixed_2,
      Constants.SwingMode_Fixed_3,
      Constants.SwingMode_Fixed_4,
      Constants.SwingMode_Fixed_5,
    ],
  },
  {
    capability: Constants.CapabilityTargetSwingMode2,
    modes: [Constants.SwingMode_Off, Constants.SwingMode_SwingVertical],
  },
  {
    capability: Constants.CapabilityTargetSwingMode3,
    modes: [
      Constants.SwingMode_Off,
      Constants.SwingMode_SwingVertical,
      Constants.SwingMode_SwingHorizontal,
      Constants.SwingMode_SwingVerticalAndHorizontal,
    ],
  },
  {
    capability: Constants.CapabilityTargetSwingMode4,
    modes: [
      Constants.SwingMode_Off,
      Constants.SwingMode_SwingVertical,
      Constants.SwingMode_Fixed_1,
      Constants.SwingMode_Fixed_2,
      Constants.SwingMode_Fixed_3,
      Constants.SwingMode_Fixed_4,
      Constants.SwingMode_Fixed_5,
    ],
  },
];

exports.powerModes = [
  Constants.PowerSelection_power_none,
  Constants.PowerSelection_power_50,
  Constants.PowerSelection_power_75,
  Constants.PowerSelection_power_100,
];

exports.fanModes = [
  Constants.FanMode_Auto,
  Constants.FanMode_Quiet,
  Constants.FanMode_Low,
  Constants.FanMode_Medium_Low,
  Constants.FanMode_Medium,
  Constants.FanMode_Medium_High,
  Constants.FanMode_High,
];

exports.disabledMeritAForMode = [
  {
    mode: Constants.Auto,
    disabled: [
      Constants.MeritA_Heating_8C,
      Constants.MeritA_Sleep_Care,
      Constants.MeritA_Floor,
    ],
  },
  {
    mode: Constants.Cool,
    disabled: [
      Constants.MeritA_Heating_8C,
      Constants.MeritA_Sleep_Care,
      Constants.MeritA_Floor,
    ],
  },
  {
    mode: Constants.Dry,
    disabled: [
      Constants.MeritA_High_Power,
      Constants.MeritA_Eco,
      Constants.MeritA_CDU_Silent_1,
      Constants.MeritA_CDU_Silent_2,
      Constants.MeritA_Heating_8C,
      Constants.MeritA_Sleep_Care,
      Constants.MeritA_Floor,
    ],
  },
  { mode: Constants.Heat, disabled: [] },
  {
    mode: Constants.Fan,
    disabled: [
      Constants.MeritA_High_Power,
      Constants.MeritA_Eco,
      Constants.MeritA_CDU_Silent_1,
      Constants.MeritA_CDU_Silent_2,
      Constants.MeritA_Heating_8C,
      Constants.MeritA_Sleep_Care,
      Constants.MeritA_Floor,
    ],
  },
];

exports.disabledMeritBForMode = [
  {
    mode: Constants.Auto,
    disabled: [Constants.MeritB_Fire_Place_1, Constants.MeritB_Fire_Place_2],
  },
  {
    mode: Constants.Cool,
    disabled: [Constants.MeritB_Fire_Place_1, Constants.MeritB_Fire_Place_2],
  },
  {
    mode: Constants.Dry,
    disabled: [Constants.MeritB_Fire_Place_1, Constants.MeritB_Fire_Place_2],
  },
  { mode: Constants.Heat, disabled: [] },
  {
    mode: Constants.Fan,
    disabled: [Constants.MeritB_Fire_Place_1, Constants.MeritB_Fire_Place_2],
  },
];

async function addCapabilityToDevice(device, type, name) {
  if (!device.hasCapability(name)) {
    await device.addCapability(name);
    // add listener
    device.registerCapabilityListener(name, async (value, opts) => {
      await device.setCapabilityValue(name, value);
      await device.updateStateAfterUpdateCapability(false);
    });
  }
  if (type) {
    await device.setStoreValue(type, name);
  }
}

async function determineACMode(device, bit6, bit7) {
  let name = Constants.CapabilityTargetACMode1;
  if (!bit6 && bit7) {
    name = Constants.CapabilityTargetACMode2;
  } else if (bit6 && !bit7) {
    name = Constants.CapabilityTargetACMode3;
  }
  await addCapabilityToDevice(
    device,
    Constants.StoredCapabilityTargetACMode,
    name,
  );
}

async function determineSwingMode(device, bit1, bit14, type) {
  let name = Constants.CapabilityTargetSwingMode2;

  if (type === '2') {
    if (bit1) {
      name = Constants.CapabilityTargetSwingMode3;
    }
  } else if (type === '3') {
    if (bit1 && bit14) {
      name = Constants.CapabilityTargetSwingMode1;
    } else if (bit1) {
      name = Constants.CapabilityTargetSwingMode3;
    } else if (bit14) {
      name = Constants.CapabilityTargetSwingMode4;
    }
  }
  await addCapabilityToDevice(
    device,
    Constants.StoredCapabilityTargetSwingMode,
    name,
  );
}

async function determineAirPureIon(device, bit) {
  if (bit) {
    await addCapabilityToDevice(
      device,
      '',
      Constants.CapabilityTargetAirPureIon,
    );
  }
}

async function determineMeritA(device, bit0, bit2, bit5, type) {
  if (type === '2' || type === '3') {
    meritA.push(Constants.MeritA_High_Power);
    meritA.push(Constants.MeritA_Eco);
  }
  if (bit0) {
    meritA.push(Constants.MeritA_Floor);
  }
  if (bit2) {
    meritA.push(Constants.MeritA_CDU_Silent_1);
    meritA.push(Constants.MeritA_CDU_Silent_2);
  }
  if (bit5) {
    meritA.push(Constants.MeritA_Heating_8C);
  }
  await device.setStoreValue(Constants.StoredValuesMeritA, meritA);
}

async function determineMeritB(device, bit) {
  if (bit) {
    await addCapabilityToDevice(device, '', Constants.CapabilityTargetMeritB);
    meritB.push(Constants.MeritB_Fire_Place_1);
    meritB.push(Constants.MeritB_Fire_Place_2);
  }
  await device.setStoreValue(Constants.StoredValuesMeritB, meritB);
}

async function determineEnergyConsumption(device, bit) {
  if (bit) {
    await addCapabilityToDevice(
      device,
      '',
      Constants.CapabilityEnergyConsumptionLastHour,
    );
    await addCapabilityToDevice(
      device,
      '',
      Constants.CapabilityEnergyConsumptionToday,
    );
    device.setEnergyIntervalTimer();
  }
}

function toBoolean(string) {
  return string === '1';
}

exports.setCapabilities = async device => {
  const deviceData = device.getData();
  const { MeritFeature } = deviceData;
  const type = deviceData.ACModelID;
  const meritFeatureBitString = parseInt(MeritFeature, 16).toString(2).padStart(16, '0');

  const meritBit0 = meritFeatureBitString.substring(0, 1);
  const meritBit1 = toBoolean(meritFeatureBitString.substring(1, 2));
  const meritBit2 = toBoolean(meritFeatureBitString.substring(2, 3));
  const meritBit3 = toBoolean(meritFeatureBitString.substring(3, 4));
  const meritBit4 = toBoolean(meritFeatureBitString.substring(4, 5));
  const meritBit5 = toBoolean(meritFeatureBitString.substring(5, 6));
  const meritBit6 = toBoolean(meritFeatureBitString.substring(6, 7));
  const meritBit7 = toBoolean(meritFeatureBitString.substring(7, 8));
  const meritBit14 = toBoolean(meritFeatureBitString.substring(14, 15));
  const meritBit15 = toBoolean(meritFeatureBitString.substring(15));

  await determineACMode(device, meritBit6, meritBit7);
  await determineSwingMode(device, meritBit1, meritBit14, type);
  await determineAirPureIon(device, meritBit3);
  await determineMeritA(device, meritBit0, meritBit2, meritBit5, type);
  await determineMeritB(device, meritBit4);
  await determineEnergyConsumption(device, meritBit15);
};
