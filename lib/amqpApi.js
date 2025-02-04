const { SimpleClass } = require('homey');
const Protocol = require('azure-iot-device-amqp').Amqp;
const { Client } = require('azure-iot-device');
const { Message } = require('azure-iot-device');
const hexToBinary = require('hex-to-binary');
const Uuid = require('uuid');
const Constants = require('./constants');

// Helper function to print results in the console
function printResultFor(op, homey, deviceUniqueID, message ) {
  return function printResult(err, res) {
    if (err) homey.app.logInformation(`AMQP sendMessage`, `Send``${op} error: ${err.toString()}`);
    else{
      homey.app.logInformation( `AMQP sendMessage`, `Send: ${deviceUniqueID} ${message}`);
    }
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

  setToken(sasToken) {
    this.sasToken = sasToken;
  }

  convertHexToDecimal(value) {
    const binStr = hexToBinary(value);
    let result = parseInt(
      binStr.length >= 8 && binStr[0] === '1'
        ? binStr.padStart(32, '1')
        : binStr.padStart(32, '0'),
      2,
    ) >> 0;
    if (result < -50 || result > 50) {
      const dec = parseInt(value, 16);
      result = dec >= 125 ? -1 * (dec - 125) : dec;
    }
    return result;
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
            case Constants.CMD_HEARTBEAT:
              device.updateStateAfterHeartBeat(
                parseInt(payload.payload.iTemp, 16),
                this.convertHexToDecimal(payload.payload.oTemp),
              );
              this.Driver.homey.app.logStates(`Received: ${device.getData().DeviceUniqueID} ${device.getName()} ${command} ${payload.payload.iTemp} ${payload.payload.oTemp}`);
              break;
            case Constants.CMD_FCU_FROM_AC:
              device.updateState(payload.payload.data);
              this.Driver.homey.app.logStates(`Received: ${device.getData().DeviceUniqueID} ${device.getName()} ${command} ${payload.payload.data}`);
              break;
            case Constants.CMD_SET_SCHEDULE_FROM_AC: // for now do nothing
              break;
            default:
              driver.log('Unknown command', command);
          }
        }
      } catch (ex) {
        this.Driver.homey.app.logInformation(`AMQP createStatusUpdateHandler`, `error: ${ex.toString()}`);
      }
    })
  }

  async sendMessage(message, deviceUniqueID) {
    const messageId = Uuid.v4();
    const fcuToAc = {
      sourceId: this.DeviceIDHomey,
      messageId,
      targetId: [deviceUniqueID],
      cmd: Constants.CMD_FCU_TO_AC,
      payload: { data: message },
      timeStamp: '0000000',
    };
    const msg = new Message(JSON.stringify(fcuToAc));
    msg.properties.add('type', 'mob');
    msg.contentType = 'application/json';
    msg.contentEncoding = 'utf-8';

    this.client.sendEvent(msg, printResultFor('send', this.Driver.homey, deviceUniqueID, message ));
  }

};
