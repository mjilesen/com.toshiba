const http = require("./httpService");
const { SimpleClass } = require("homey");
const Constants = require("./constants")

module.exports = class ACHelper extends SimpleClass {

  constructor(Homey, username, password, token_information ) {
    super();
    this.homey = Homey;
    this.token_information = token_information;
    this.username = username;
    this.password = password;
    return this;
  }

  async getACs() {
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
          data: {id: ac.Id},
          settings: { username: username,
                      password: password
                    },
         store:{ tokeninformation: tokeninfo,
                 groupid: group.GroupId,
                 groupname: group.GroupName,
                 state: ac.ACStateData }
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
      this.username = username;
      this.password = password;
    }
    return data
};

async updateACState( device ){

}

  async doGetRequest(url ) {
    const params = {consumerId: this.token_information.consumerId }
    const header = {Authorization: "Bearer " + this.token_information.access_token };

    const config = {
      method: "get",
      url: url,
      headers: header,
      params: params
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
  }

  async doPostRequest(url, json) {
    //execute the request
    try {
      const { data } = await http.post(url, json );
      //status 200 but Homey didn't manage to start/stop
      if (data && data.message_type === "error") {
        throw new Error(data.message);
      }
      return data;
    } catch (ex ) {
      let er = new Error(ex);
      return Promise.reject( er );
    }
  }

  getUrl(suburl) {
    return Constants.BASE_URL + suburl;
  }
};
