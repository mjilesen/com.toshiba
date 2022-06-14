'use strict';
const { Driver } = require('homey');

const Homey = require( 'homey' );
const httpApi = require( "../../lib/ToshibaHttpApi");
const amqpApi = require( "../../lib/ToshibaAmqpApi");
const uuid = require("uuid");

class ACDriver extends Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('ACDriver has been initialized');
    this.homey.settings.unset("DeviceID")
    let deviceID = this.homey.settings.get( "DeviceID")
    if ( !deviceID ){
      deviceID = "Homey-" + uuid.v4()
      this.homey.settings.set( "DeviceID", deviceID )
    }
    this.deviceId = deviceID

    this.httpAPI = await new httpApi(this.homey )

    if ( this.homey.settings.get( "Username") ){
      await this.initializeAmqp()
    }
  }

  async initializeAmqp(){
    const token = await this.httpAPI.getSASToken( this.deviceId);
    this.amqpAPI = await new amqpApi( token, this )
  }

  async onPair( session )
  {
      let username = "";
      let password = "";
      let resobj;

      session.setHandler("login", async (data) => {
      username = data.username;
      password = data.password;

      //save the username and password
      this.homey.settings.set("Username", username);
      this.homey.settings.set("Password", password );

      resobj = await this.httpAPI.login( username, password );

      if ( resobj.IsSuccess && !this.amqpAPI ){
        this.initializeAmqp()
      }
       // return true to continue adding the device if the login succeeded
       // return false to indicate to the user the login attempt failed
       // thrown errors will also be shown to the user
       return resobj.IsSuccess;
     });

     session.setHandler("list_devices", async () => {
        const devices = await this.httpAPI.getACs()
        return devices
  });
  }

  async sendMessage( message){
    await this.amqpAPI.sendMessage( message )
  }
}
module.exports = ACDriver;
