const http = require("./httpService");
const { SimpleClass } = require("homey");
const Constants = require("./constants")
const Protocol = require('azure-iot-device-amqp').Amqp;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const StateUtils = require ("../../lib/state_utils");
const uuid = require("uuid");

module.exports = class ToshibaAmqpApi extends SimpleClass {
  constructor( sasToken, driver_i ) {
    super();
    this.sasToken = sasToken;
    this.DeviceIDHomey = driver_i.deviceID;
    this.Driver = driver_i;

    // fromSharedAccessSignature must specify a transport constructor, coming from any transport package.
    this.client = Client.fromSharedAccessSignature( sasToken, Protocol);
    this.createStatusUpdateHandler();
    return this;
  };

  createStatusUpdateHandler(){
    const driver = this.Driver;
    //define handler for messages from AC's
    this.client.onDeviceMethod("smmobile", function (request ) {
      try {
        const command = request.payload.cmd;
        const payload = request.payload;
        console.log("received a request for smmobile", payload );
        const devices = driver.getDevices()
        const device = devices.find( obj => {
              return obj.getData().DeviceUniqueID === request.payload.sourceId
            });

        if ( device ){
          switch (command) {
            case Constants.CMD_HEARTBEAT: device.updateStateAfterHeartBeat( parseInt( payload.payload.iTemp, 16 ) ,
                                                                            parseInt( payload.payload.oTemp, 16 ) );
                                          break;
            case Constants.CMD_FCU_FROM_AC: device.updateState( payload.payload.data )
                                          break;
            case Constants.CMD_SET_SCHEDULE_FROM_AC: //for now do nothing
                                          break;
            default: console.log( "Unknown command" )
          }
        }
      }
      catch (ex)
      {
        this.log( "Not able to proces status update: ", ex )
      }
    });
  };

  async sendMessage( message, DeviceUniqueID ){
    const messageId = uuid.v4();
    let fcu_to_ac = {
        "sourceId": this.DeviceIDHomey,
        "messageId": messageId,
        "targetId": [DeviceUniqueID],
        "cmd": Constants.CMD_FCU_TO_AC,
        "payload": {"data": message },
        "timeStamp": "0000000",
     }
    let msg = new Message( JSON.stringify( fcu_to_ac ) );

    msg.properties.add( "type", "mob")
    msg.contentType = "application/json"
    msg.contentEncoding = "utf-8"

    await this.client.sendEvent(msg, printResultFor('send') )
  }
};

// Helper function to print results in the console
function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
};
