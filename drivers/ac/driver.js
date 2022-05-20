'use strict';
const { Driver } = require('homey');

const  Homey = require( 'homey' );
const ACHelper = require( "../../lib/AC");

class ACDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');
    this.acHelper = new ACHelper(this.homey, null, null, null );
  }

  async onPair( session )
  {
      let username = "";
      let password = "";
      let resobj;

      session.setHandler("login", async (data) => {
      username = data.username;
      password = data.password;

       resobj = await this.acHelper.login( username, password );

       // return true to continue adding the device if the login succeeded
       // return false to indicate to the user the login attempt failed
       // thrown errors will also be shown to the user
       return resobj.IsSuccess;
     });

     session.setHandler("list_devices", async () => {
        const devices = await this.acHelper.getACs()
        return devices
  });
  }

}

module.exports = ACDriver;
