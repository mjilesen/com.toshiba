/* jslint node: true */

module.exports = {
  async SendInfoLog({ homey, body }) {
    return homey.app.sendLog('infoLog');
  },
  async SendEventLog({ homey, body }) {
    return homey.app.sendLog('eventLog');
  },
};
