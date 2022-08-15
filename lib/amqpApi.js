const { SimpleClass } = require('homey');
const Protocol = require('azure-iot-device-amqp').Amqp;
const { Client } = require('azure-iot-device');
const { Message } = require('azure-iot-device');
const Uuid = require('uuid');
const Constants = require('./constants');

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    // if (err) this.driver.log(`${op} error: ${err.toString()}`);
  };
}

module.exports = class AmqpApi extends SimpleClass {

  constructor(sasToken, driverI) {
    super();
    this.setToken(sasToken);
    this.DeviceIDHomey = driverI.deviceID;
    this.Driver = driverI;

    // fromSharedAccessSignature must specify a transport constructor, coming from any transport package.
    this.client = Client.fromSharedAccessSignature(sasToken, Protocol);
    this.createStatusUpdateHandler();
    return this;
  }

  setToken( sasToken ){
    this.sasToken = sasToken;
  }
  createStatusUpdateHandler() {
    const driver = this.Driver;
    // define handler for messages from AC's
    this.client.onDeviceMethod('smmobile', request => {
      try {
        const command = request.payload.cmd;
        const { payload } = request;

        const devices = driver.getDevices();
        const device = devices.find(obj => {
          return obj.getData().DeviceUniqueID === payload.sourceId;
        });

        if (device) {
          switch (command) {
            case Constants.CMD_HEARTBEAT: device.updateStateAfterHeartBeat(parseInt(payload.payload.iTemp, 16),
              parseInt(payload.payload.oTemp, 16));
              break;
            case Constants.CMD_FCU_FROM_AC: device.updateState(payload.payload.data);
              break;
            case Constants.CMD_SET_SCHEDULE_FROM_AC: // for now do nothing
              break;
            default: driver.log('Unknown command', command);
          }
        }
      } catch (ex) {
        driver.log('Not able to proces status update: ', ex);
      }
    });
  }

  async sendMessage(message, DeviceUniqueID) {
    const messageId = Uuid.v4();
    const fcuToAc = {
      sourceId: this.DeviceIDHomey,
      messageId,
      targetId: [DeviceUniqueID],
      cmd: Constants.CMD_FCU_TO_AC,
      payload: { data: message },
      timeStamp: '0000000',
    };
    const msg = new Message(JSON.stringify(fcuToAc));

    msg.properties.add('type', 'mob');
    msg.contentType = 'application/json';
    msg.contentEncoding = 'utf-8';

    await this.client.sendEvent(msg, printResultFor('send'));
  }

};
