const http = require("./httpService");
const { SimpleClass } = require("homey");
const Constants = require("./constants")


module.exports = class ToshibaHttpApi extends SimpleClass {

    constructor( Homey ) {
      super();

    this.homey = Homey;
    this.token_information = this.homey.settings.get( "TokenInformation" );
    this.username = this.homey.settings.get( "Username");
    this.password = this.homey.settings.get( "Password");
    this.params = "";
    this.header = "";

    if ( this.token_information ){
      this.setHeaderAndParams()
    }
    return this;
  }

  async getACStatus( deviceId){
    const url = this.getUrl( Constants.STATUS_PATH )
    const params = {consumerId: this.token_information.consumerId, ACId: deviceId }
    let data = await this.doGetRequest(url, params )
    return data.ACStateData
  }

  async getSASToken( deviceIDHomey){
     const url = this.getUrl( Constants.REGISTER_MOBILE_DEVICE );
     const data = await this.doPostRequest( url, { Username: this.username.trimEnd(),
                                                   DeviceID: deviceIDHomey,
                                                   DeviceType: "1"
                                                 } )

     if ( !data.IsSuccess ){
       let er = new Error(data.Message);
       return Promise.reject( er )
     }
     return data.ResObj.SasToken
  };

  async getACs() {
    console.log(" get ac's")
    let acs = [];
    const url = this.getUrl( Constants.MAPPING_PATH );
    const data = await this.doGetRequest(url);

    let username = this.username
    let password =  this.password
    let tokeninfo = this.token_information

    data.forEach((group, i) => {
    group.ACList.forEach((ac, i) => {

      acs.push({
          name: ac.Name,
          data: {DeviceId: ac.Id,
                 DeviceUniqueID:ac.DeviceUniqueId,
                 Groupid: group.GroupId,
                 GroupName: group.GroupName,
                 ACModelID: ac.ACModelId,
                 MeritFeature: ac.MeritFeature
                 },
          store:{ state: ac.ACStateData }
        });
      });
    });

    return acs;
  };

  async login( username, password){
    const url = this.getUrl( Constants.LOGIN_PATH );
        const json = {
          Username: username,
          Password: password
         }
    const data = await this.doPostRequest( url, json);
    const success = data.IsSuccess

    if ( success ){
      this.token_information = data.ResObj;
      this.homey.settings.set( Constants.SettingTokenInformation, this.token_information )
      this.username = username;
      this.password = password;
      this.setHeaderAndParams()
    }
    return data
};

setHeaderAndParams(){
  this.params = {consumerId: this.token_information.consumerId }
  this.header = {Authorization: "Bearer " + this.token_information.access_token };
}

async doGetRequest(url, params ) {
    const parameters = params?params:this.params;
    const config = {
      method: "get",
      url: url,
      headers: this.header,
      params: parameters
    }

    try {
      const { data } = await http.axios(config );
      //status 200 but error from Toshiba
      if (data && !data.IsSuccess) {
        throw new Error(data.Message);
      }
      return data.ResObj;
    } catch (ex ) {
      let er = new Error(ex);
      return Promise.reject( er );
    }
  };

  async doPostRequest(url, json) {
    const config = {
      method: "post",
      url: url,
      headers: this.header,
      params: this.params,
      data: json
    }

    //execute the request
    try {
      const { data } = await http.axios( config );
      //status 200 but Homey didn't manage to start/stop
      if (data && data.message_type === "Error") {
        throw new Error(data.message);
      }
      return data;
    } catch (ex ) {
      let er = new Error(ex);
      return Promise.reject( er );
    }
  };

  getUrl(suburl) {
    return Constants.BASE_URL + suburl;
  }
};
