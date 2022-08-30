const { Driver } = require('homey');

const Uuid = require('uuid');

const HttpApi = require('../../lib/httpApi');
const AmqpApi = require('../../lib/amqpApi');
const Constants = require('../../lib/constants');
const EnergyConsumption = require('../../lib/energyConsumption');

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

    this.energyConsumption = await new EnergyConsumption(this);

    this.initEnergyTimer();
  }

  async initEnergyTimer() {
    const devices = this.getDevices();
    devices.forEach(device => device.setEnergyIntervalTimer());
  }

  async initializeAmqp() {
    const token = await this.httpAPI.getSASToken(this.deviceId);
    if (!this.amqpAPI) {
      this.amqpAPI = await new AmqpApi(token, this);
    } else {
      this.amqpAPI.setToken(token);
    }
  }

  async onPair(session) {
    session.setHandler('login', async data => {
      return this.login(data.username, data.password);
    });
    session.setHandler('list_devices', async () => {
      const devices = await this.httpAPI.getACs();
      return devices;
    });
  }

  async onRepair(session, device) {
    session.setHandler('login', async data => {
      const returnValue = await this.login(data.username, data.password);
      device.fixCapabilities();
      return returnValue;
    });
  }

  async login(username, password) {
    // save the username and password
    this.homey.settings.set(Constants.SettingUserName, username);
    this.homey.settings.set(Constants.SettingPassword, password);

    const resobj = await this.httpAPI.login(username, password);
    if (resobj.IsSuccess) {
      this.initializeAmqp();
    }
    // return true to continue adding the device if the login succeeded
    // return false to indicate to the user the login attempt failed
    // thrown errors will also be shown to the user
    return resobj.IsSuccess;
  }

  async sendMessage(message) {
    await this.amqpAPI.sendMessage(message);
  }

}
module.exports = ACDriver;
