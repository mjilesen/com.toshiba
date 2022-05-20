
//"""Constant for Toshiba AC API."""
exports.DOMAIN = "toshiba_ac"

exports.BASE_URL = "https://toshibamobileservice.azurewebsites.net"
exports.LOGIN_PATH = "/api/Consumer/Login"
exports.DEVICE_PATH = "/api/AC/GetRegisteredACByUniqueId"
exports.MAPPING_PATH = "/api/AC/GetConsumerACMapping"
exports.STATUS_PATH = "/api/AC/GetCurrentACState"
exports.CONSUMER_PATH = "/api/Consumer/GetConsumerSetting"
exports.PROGRAM_GET_PATH = "/api/AC/GetConsumerProgramSettings"
exports.PROGRAM_SET_PATH = "/api/AC/SaveACProgramSetting"
exports.PROGRAM_GROUP_SET_PATH = "/api/AC/SaveGroupProgramSetting"


//"""Toshiba AC constants and enumerations."""
exports.ON = true
exports.OFF = false

exports.Auto = "Auto"
exports.Cool = "Cool"
exports.Heat = "Heat"
exports.Dry = "Dry"
exports.Fan = "Fan"
exports.Off = "Off"

exports.FanMode_None = "None"
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
exports.SwingMode_None = "None"

exports.PowerSelection_power_50 = "Power 50%"
exports.PowerSelection_power_75 = "Power 75%"
exports.PowerSelection_power_100 = "Power 100%"
exports.PowerSelection_power_none = "None"

exports.UseAirPureIon = 18
exports.UseAirPureIonOff = 10

exports.hundreadPercent = 40
exports.seventyFivePercent = 65
exports.fiftyPercent = 66

exports.schedulerOff = "02"
exports.schedulerOn = "01"
