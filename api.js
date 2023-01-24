/* jslint node: true */

module.exports = {
  async SendInfoLog({ homey, body }) {
    return homey.app.sendLog('infoLog');
  },
  async SendStateLog({ homey, body }) {
    return homey.app.sendLog('stateLog');
  },
  async SendDeviceInformation({ homey, body }) {
    return homey.app.sendLog('deviceInformation');
  },
  async GetDeviceInformation({ homey, body }) {
    return homey.app.getDeviceInformation();
  }
};


