/* jslint node: true */

module.exports = {
  async SendInfoLog({ homey, body }) {
    return homey.app.sendLog('infoLog');
  },
  async SendStateLog({ homey, body }) {
    return homey.app.sendLog('stateLog');
  },
};
