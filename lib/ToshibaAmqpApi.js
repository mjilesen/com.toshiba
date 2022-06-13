const http = require("./httpService");
const { SimpleClass } = require("homey");
const Constants = require("./constants")
const Protocol = require('azure-iot-device-amqp').Amqp;
const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;
const StateUtils = require ("../../lib/state_utils");
const uuid = require("uuid");

const functions = { CMD_HEARTBEAT: function( payload ){ this.processHeartBeat(payload) },
                    CMD_FCU_FROM_AC: function( payload) { this.processCMDFromAC(payload)}
                  };


module.exports = class ToshibaAmqpApi extends SimpleClass {
  constructor( sasToken, deviceID ) {
    super();
    this.sasToken = sasToken;
    this.DeviceID = deviceID;

    // fromSharedAccessSignature must specify a transport constructor, coming from any transport package.
    this.client = Client.fromSharedAccessSignature( sasToken, Protocol);

    this.client.onDeviceMethod("smmobile", function (request) {
        console.log("received a request for smmobile", request.payload.cmd, request);
        const command = request.payload.cmd
        //let func = functions[command]( request.payload )
        //console.log( "func", func)
        if ( command === "CMD_HEARTBEAT"){
          console.log( "hier")
            // this.processHeartBeat( "xxx" )
              const devices = this.driver.getDevices()
              console.log( "devices", devices.length, devices )
              const device = devices.find( obj => {
              return obj.getData.DeviceUniqueID === payload.sourceId
            })
            console.log( "Device found", device )
            if ( device ){
              if ( payload.oTemp){ StateUtils.setOutsideTemperature( device, parseInt( payload.payload.oTemp ) )}
              if ( payload.iTemp){ StateUtils.setInsideTemperature( device, parseInt( payload.payload.iTemp ) ) }
            }
        }
        else if ( command === "CMD_FCU_FROM_AC"){
          console.log( "daar")
          const device = this.driver.getDevices().find( obj => {
            return obj.getData.DeviceUniqueID === payload.sourceId
          })
          console.log( "had device", obj.getData.DeviceUniqueID, payload.sourceId )
          if ( device){
            console.log( "State", payload.payload.data )
            device.updateState( payload.payload.data )
          }
    //         this.processCMDFromAC( "xxx" )
        }
    });
    return this;
  };

  processHeartBeat( payload ){
    console.log( "heartbeat", payload )
    const device = this.driver.getDevices().find( obj => {
      return obj.getData.DeviceUniqueID = payload.sourceId
    })
    if ( device ){
      if ( payload.oTemp){ StateUtils.setOutsideTemperature( device, parseInt( payload.oTemp ) )}
      if ( payload.iTemp){ StateUtils.setInsideTemperature( device, parseInt( payload.iTemp ) ) }
    }
  };

  processCMDFromAC( payload ){
    console.log( "cmd ", payload)
    // this.Device.updateState( payload.data );
  };

  async sendMessage( message, DeviceUniqueID ){
    const messageId = uuid.v4();
    let fcu_to_ac = {
        "sourceId": this.DeviceID,
        "messageId": messageId,
        "targetId": [DeviceUniqueID],
        "cmd": "CMD_FCU_TO_AC",
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
