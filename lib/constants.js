
//"""Constant for Toshiba AC API."""
exports.DOMAIN = "toshiba_ac"

exports.BASE_URL = "https://mobileapi.toshibahomeaccontrols.com"
exports.LOGIN_PATH = "/api/Consumer/Login"
exports.DEVICE_PATH = "/api/AC/GetRegisteredACByUniqueId"
exports.MAPPING_PATH = "/api/AC/GetConsumerACMapping"
exports.STATUS_PATH = "/api/AC/GetCurrentACState"
exports.CONSUMER_PATH = "/api/Consumer/GetConsumerSetting"
exports.PROGRAM_GET_PATH = "/api/AC/GetConsumerProgramSettings"
exports.PROGRAM_SET_PATH = "/api/AC/SaveACProgramSetting"
exports.PROGRAM_GROUP_SET_PATH = "/api/AC/SaveGroupProgramSetting"
exports.REGISTER_MOBILE_DEVICE = "/api/Consumer/RegisterMobileDevice"

//toshiba AmqpCommands
exports.CMD_HEARTBEAT = "CMD_HEARTBEAT";
exports.CMD_FCU_FROM_AC = "CMD_FCU_FROM_AC";
exports.CMD_SET_SCHEDULE_FROM_AC = "CMD_SET_SCHEDULE_FROM_AC"
exports.CMD_FCU_TO_AC = "CMD_FCU_TO_AC"

//"""Toshiba AC constants and enumerations."""
exports.ON = true
exports.OFF = false

exports.Auto = "Auto"
exports.Cool = "Cool"
exports.Heat = "Heat"
exports.Dry = "Dry"
exports.Fan = "Fan"
exports.Off = "Off"

exports.FanMode_Auto = "Auto"
exports.FanMode_Quiet = "Quiet"
exports.FanMode_Low = "Low"
exports.FanMode_Medium_Low = "MediumLow"
exports.FanMode_Medium = "Medium"
exports.FanMode_Medium_High = "MediumHigh"
exports.FanMode_High = "High"

exports.SwingMode_Off = "Off"
exports.SwingMode_SwingVertical = "Swing vertical"
exports.SwingMode_SwingHorizontal = "Swing horizontal"
exports.SwingMode_SwingVerticalAndHorizontal = "Swing vertical and horizontal"
exports.SwingMode_Fixed_1 = "Fixed 1"
exports.SwingMode_Fixed_2 = "Fixed 2"
exports.SwingMode_Fixed_3 = "Fixed 3"
exports.SwingMode_Fixed_4 = "Fixed 4"
exports.SwingMode_Fixed_5 = "Fixed 5"

exports.PowerSelection_power_50 = "Power 50%"
exports.PowerSelection_power_75 = "Power 75%"
exports.PowerSelection_power_100 = "Power 100%"
exports.PowerSelection_power_none = "None"

exports.MeritA_Off = "Off";
exports.MeritA_Sleep_Care = "Sleep care";
exports.MeritA_Comfort = "Comfort";
exports.MeritA_High_Power = "High Power";
exports.MeritA_Eco = "Eco";
exports.MeritA_Floor = "Floor";
exports.MeritA_CDU_Silent_1 = "CDU Silent 1";
exports.MeritA_CDU_Silent_2 = "CDU Silent 2";
exports.MeritA_Heating_8C = "Heating 8C";

exports.MeritB_Off = "Off";
exports.MeritB_Fire_Place_1 = "Fire Place 1";
exports.MeritB_Fire_Place_2 = "Fire Place 2";

exports.NONE_VAL = 0xFF;

//exports.UseAirPureIon = 18
//exports.UseAirPureIonOff = 10

//state positions
exports.PositionByteOnOff = 0;
exports.PositionByteMode = 1;
exports.PostionByteTargetTemperature = 2;
exports.PostionByteFanMode = 3;
exports.PositionByteSwingMode = 4;
exports.PostionBytePowerSelection = 5;
exports.PostionByteMeritA = 6;
exports.PostionByteMeritB = 7;
exports.PostionByteAirPureIon = 8;
exports.PositionByteInsideTemperature = 9;
exports.PositionByteOutsideTemperature = 10;
exports.PostionByteSelfCleaning = 15;

//settings
exports.SettingDriverDeviceID = "DeviceID";
exports.SettingUserName = "Username";
exports.SettingPassword = "Password";
exports.SettingTokenInformation = "TokenInformation";
//stored values
exports.StoredValueState = "state";
exports.StoredCapabilityTargetACMode = "target_ac_mode"
exports.StoredCapabilityTargetSwingMode = "target_swing_mode"
exports.StoredValuesMeritA = "ValuesMeritA";
exports.StoredValuesMeritB = "ValuesMeritB";
//capabilities
exports.CapabilityOnOff = "onoff";

exports.CapabilityTargetACMode1 = "target_ac_mode1";
exports.CapabilityTargetACMode2 = "target_ac_mode2";
exports.CapabilityTargetACMode3 = "target_ac_mode3";

exports.CapabilityTargetSwingMode1 = "target_swing_mode1"
exports.CapabilityTargetSwingMode2 = "target_swing_mode2"
exports.CapabilityTargetSwingMode3 = "target_swing_mode3"
exports.CapabilityTargetSwingMode4 = "target_swing_mode4"

exports.CapabilityTargetTemperatureInside = "target_temperature.inside";
exports.CapabilityTargetFanMode = "target_fan_mode";
exports.CapabilityTargetPowerMode = "target_power_mode";
exports.CapabilityTargetAirPureIon = "target_air_pure_ion";
exports.CapabilityTargetMeritA = "target_ac_merit_a";
exports.CapabilityTargetMeritB = "target_ac_merit_b";
exports.CapabilitySelfCleaning = "target_self_cleaning"

exports.CapabilityMeasureTemperaturOutside = "measure_temperature_outside";
exports.CapabilityMeasureTemperatureInside = "measure_temperature.inside";

//getData
exports.DataMeritFeature = "meritFeature";
exports.DataACModelID = "ACModelID";
