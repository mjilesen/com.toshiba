const { Driver } = require('homey');

const Uuid = require('uuid');

const HttpApi = require('../../lib/ToshibaHttpApi');
const AmqpApi = require('../../lib/ToshibaAmqpApi');
const Constants = require('../../lib/constants');

class ACDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('ACDriver has been initialized');
    let deviceID = await this.homey.settings.get(Constants.SettingDriverDeviceID);
    if (!deviceID) {
      deviceID = `Homey-${Uuid.v4()}`;
      await this.homey.settings.set(Constants.SettingDriverDeviceID, deviceID);
    }
    this.deviceId = deviceID;

    this.httpAPI = await new HttpApi(this.homey);

    if (await this.homey.settings.get(Constants.SettingUserName)) {
      await this.initializeAmqp();
    }
  }

  async initializeAmqp() {
    const token = await this.httpAPI.getSASToken(this.deviceId);
    this.amqpAPI = await new AmqpApi(token, this);
  }

  async onPair(session) {
    let username = '';
    let password = '';
    let resobj;

    session.setHandler('login', async data => {
      username = data.username;
      password = data.password;

      // save the username and password
      this.homey.settings.set(Constants.SettingUserName, username);
      this.homey.settings.set(Constants.SettingPassword, password);

      resobj = await this.httpAPI.login(username, password);
      if (resobj.IsSuccess && !this.amqpAPI) {
        this.initializeAmqp();
      }
      // return true to continue adding the device if the login succeeded
      // return false to indicate to the user the login attempt failed
      // thrown errors will also be shown to the user
      return resobj.IsSuccess;
    });

    session.setHandler('list_devices', async () => {
      const devices = await this.httpAPI.getACs();
      return devices;
    });
  }

  async sendMessage(message) {
    await this.amqpAPI.sendMessage(message);
  }

}
module.exports = ACDriver;
