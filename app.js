const Homey = require('homey');
const send = require('gmail-send')({ subject: 'test' });
const FlowSelections = require('./lib/flowSelection');
const Constants = require('./lib/constants');

class ToshibaACApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */

  async onInit() {
    this.log('ToshibaACApp has been initialized');
    this.initFlows();
    this.initConditions();
    this.initLogs();
  }

  async initLogs() {
    this.homey.settings.set('infoLog', '');
    this.homey.settings.set('stateLogEnabled', false);
    this.homey.settings.set('stateLog', '');
    this.homey.settings.set('deviceInformation', '');

    this.homeyHash = await this.homey.cloud.getHomeyId().catch(error => this.logInformation('App.Init logs',
      {
        message: error.message,
        stack: error.stack,
      }));
    this.homeyHash = this.hashCode(this.homeyHash).toString();
  }

  async initFlows() {
    // mode
    const modeActionCard = this.homey.flow.getActionCard('SetMode');
    modeActionCard.registerRunListener(async (args, state) => {
      const { device } = args;

      const acMode = await device.getStoreValue(
        Constants.StoredCapabilityTargetACMode,
      );
      await device.setCapabilityValue(acMode, args.acMode.id).catch(error => this.logInformation('App.Init flows.SetMode',
        {
          message: error.message,
          stack: error.stack,
        }));
      if (args.meritA) {
        await device.setCapabilityValue(
          Constants.CapabilityTargetMeritA,
          args.meritA.id,
        ).catch(error => this.logInformation('App.Init flows.MeritA',
          {
            message: error.message,
            stack: error.stack,
          }));
      }
      if (
        args.meritB
        && device.hasCapability(Constants.CapabilityTargetMeritB)
      ) {
        await device.setCapabilityValue(
          Constants.CapabilityTargetMeritB,
          args.meritB.id,
        ).catch(error => this.logInformation('App.Init flows.MeritB',
          {
            message: error.message,
            stack: error.stack,
          }));
      }
    });

    modeActionCard.registerArgumentAutocompleteListener(
      'acMode',
      async (query, args) => {
        const { device } = args;
        const results = FlowSelections.getModeResult(device, true);
        return device.getResult(results, query);
      },
    );

    modeActionCard.registerArgumentAutocompleteListener(
      'meritA',
      async (query, args) => {
        const acMode = args.acMode.id;
        const { device } = args;
        let results = [];
        if (acMode) {
          results = FlowSelections.getMeritAResult(device, acMode);
        }
        return device.getResult(results, query);
      },
    );

    modeActionCard.registerArgumentAutocompleteListener(
      'meritB',
      async (query, args) => {
        const acMode = args.acMode.id;
        const { device } = args;
        let results = [];
        if (acMode) {
          results = FlowSelections.getMeritBResult(device, acMode);
        }
        return device.getResult(results, query);
      },
    );

    // swing mode
    const swingModeActionCard = this.homey.flow.getActionCard('SetSwingMode');
    swingModeActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      const swingMode = await device.getStoreValue(
        Constants.StoredCapabilityTargetSwingMode,
      );
      await device.setCapabilityValue(swingMode, args.acSwingMode.id).catch(error => this.logInformation('App.Init flows.SwingMode',
        {
          message: error.message,
          stack: error.stack,
        }));
    });

    swingModeActionCard.registerArgumentAutocompleteListener(
      'acSwingMode',
      async (query, args) => {
        const { device } = args;
        const results = FlowSelections.getSwingModeResult(device, true);
        return device.getResult(results, query);
      },
    );

    // power mode
    const powerModeActionCard = this.homey.flow.getActionCard('SetPowerMode');
    powerModeActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.setCapabilityValue(
        Constants.CapabilityTargetPowerMode,
        args.acPowerMode.id,
      ).catch(error => this.logInformation('App.Init flows.PowerMode',
        {
          message: error.message,
          stack: error.stack,
        }));
    });

    powerModeActionCard.registerArgumentAutocompleteListener(
      'acPowerMode',
      async (query, args) => {
        const { device } = args;
        const results = FlowSelections.getPowerModeResult();
        return device.getResult(results, query);
      },
    );

    // fan mode
    const fanModeActionCard = this.homey.flow.getActionCard('SetFanMode');
    fanModeActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.setCapabilityValue(
        Constants.CapabilityTargetFanMode,
        args.acFanMode.id,
      ).catch(error => this.logInformation('App.Init flows.FanMode',
        {
          message: error.message,
          stack: error.stack,
        }));
    });

    fanModeActionCard.registerArgumentAutocompleteListener(
      'acFanMode',
      async (query, args) => {
        const { device } = args;
        const results = FlowSelections.getFanModeResult();
        return device.getResult(results, query);
      },
    );

    // target temperature deprecated
    const targetTemperatureActionCard = this.homey.flow.getActionCard(
      'SetTargetTemperature',
    );
    targetTemperatureActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.setCapabilityValue(
        Constants.CapabilityTargetTemperatureInside,
        args.targetTemperature,
      ).catch(error => this.logInformation('App.Init flows.TargetTemperature',
        {
          message: error.message,
          stack: error.stack,
        }));
    });

    // target temperature
    const targetTemperatureNo8CActionCard = this.homey.flow.getActionCard(
      'SetTargetTemperatureNo8C',
    );
    targetTemperatureNo8CActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.setCapabilityValue(
        Constants.CapabilityTargetTemperatureInside,
        args.targetTemperature,
      ).catch(error => this.logInformation('App.Init flows.TargetTemperatureNo8C',
        {
          message: error.message,
          stack: error.stack,
        }));
    });

    // target temperature 8c
    const targetTemperatureActionCard8c = this.homey.flow.getActionCard(
      'SetTargetTemperature8c',
    );
    targetTemperatureActionCard8c.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.setCapabilityValue(
        Constants.CapabilityTargetTemperatureInside,
        args.targetTemperature,
      ).catch(error => this.logInformation('App.Init flows.TargetTemperature8C',
        {
          message: error.message,
          stack: error.stack,
        }));
    });

    // target air pure
    const targetAirPureActionCard = this.homey.flow.getActionCard(
      'SetTargetAirPureIon',
    );
    targetAirPureActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      await device.setCapabilityValue(
        Constants.CapabilityTargetAirPureIon,
        args.targetAirPureIon,
      ).catch(error => this.logInformation('App.Init flows.AirPureIon',
        {
          message: error.message,
          stack: error.stack,
        }));
    });

    // send to AC
    const sendToACActionCard = this.homey.flow.getActionCard('SendToAC');
    sendToACActionCard.registerRunListener(async (args, state) => {
      const { device } = args;
      // Wait a couple of seconds to make sure all the async transactions are finished
      this.timerId = this.homey.setTimeout(async () => {
        await device.updateStateAfterUpdateCapability().catch(error => this.logInformation('App.Init flows.SendToAC',
          {
            message: error.message,
            stack: error.stack,
          }));
      }, 3000);
    });
  }

  initConditions() {
    // outside temperature above
    const outsideTemperatureAboveCondition = this.homey.flow.getConditionCard(
      'OutsideTemperatureAbove',
    );
    outsideTemperatureAboveCondition.registerRunListener(
      async (args, state) => {
        const { device } = args;
        const outsideTemperature = await device.getCapabilityValue(
          Constants.CapabilityMeasureTemperatureOutside,
        );
        return outsideTemperature > args.trashholdTemp;
      },
    );

    // outside temperature below
    const outsideTemperatureBelowCondition = this.homey.flow.getConditionCard(
      'OutsideTemperatureBelow',
    );
    outsideTemperatureBelowCondition.registerRunListener(
      async (args, state) => {
        const { device } = args;
        const outsideTemperature = await device.getCapabilityValue(
          Constants.CapabilityMeasureTemperatureOutside,
        );
        return outsideTemperature < args.trashholdTemp;
      },
    );

    // inside temperature above
    const insideTemperatureAboveCondition = this.homey.flow.getConditionCard(
      'InsideTemperatureAbove',
    );
    insideTemperatureAboveCondition.registerRunListener(async (args, state) => {
      const { device } = args;
      const insideTemperature = await device.getCapabilityValue(
        Constants.CapabilityMeasureTemperatureInside,
      );
      return insideTemperature > args.trashholdTemp;
    });

    // inside temperature below
    const insideTemperatureBelowCondition = this.homey.flow.getConditionCard(
      'InsideTemperatureBelow',
    );
    insideTemperatureBelowCondition.registerRunListener(async (args, state) => {
      const { device } = args;
      const insideTemperature = await device.getCapabilityValue(
        Constants.CapabilityMeasureTemperatureInside,
      );
      return insideTemperature < args.trashholdTemp;
    });

    // status equal
    const statusCondition = this.homey.flow.getConditionCard('IsStatus');
    statusCondition.registerRunListener(async (args, state) => {
      const { device } = args;
      const status = await device.getCapabilityValue(
        Constants.CapabilityStatus,
      );
      return status === args.status.id;
    });

    statusCondition.registerArgumentAutocompleteListener(
      'status',
      async (query, args) => {
        const { device } = args;
        const results = FlowSelections.getStatusResult(device, true);
        return device.getResult(results, query);
      },
    );

    // isCleaning
    const isCleaningCondition = this.homey.flow.getConditionCard('IsCleaning');
    isCleaningCondition.registerRunListener(async (args, state) => {
      const { device } = args;
      const isCleaning = await device.getCapabilityValue(
        Constants.CapabilitySelfCleaning,
      );
      return isCleaning;
    });

    // energy consumption last hour above
    const energyConsumptionLastHourAboveCondition = this.homey.flow.getConditionCard('EnergyConsumptionLastHourAbove');
    energyConsumptionLastHourAboveCondition.registerRunListener(
      async (args, state) => {
        const { device } = args;
        const energyConsumption = await device.getCapabilityValue(
          Constants.CapabilityEnergyConsumptionLastHour,
        );
        return energyConsumption > args.trashholdTemp;
      },
    );
    // energy consumption today above
    const energyConsumptionTodayAboveCondition = this.homey.flow.getConditionCard('EnergyConsumptionTodayAbove');
    energyConsumptionTodayAboveCondition.registerRunListener(
      async (args, state) => {
        const { device } = args;
        const energyConsumption = await device.getCapabilityValue(
          Constants.CapabilityEnergyConsumptionToday,
        );
        return energyConsumption > args.trashholdTemp;
      },
    );
  }

  logInformation(source, error) {
    let data = '';
    if (error) {
      data = this.varToString(error);
    }

    this.error(`${source}, ${data}`);

    try {
      if (error) {
        if (error.stack) {
          data = {
            message: error.message,
            stack: error.stack,
          };
        } else if (error.message) {
          data = error.message;
        } else {
          data = error;
        }
      }

      let logData = this.homey.settings.get('infoLog');
      if (!Array.isArray(logData)) {
        logData = [];
      }
      const nowTime = new Date(Date.now());
      logData.push(
        {
          time: nowTime.toJSON(),
          source,
          data,
        },
      );
      if (logData && logData.length > 100) {
        logData.splice(0, 1);
      }
      this.homey.settings.set('infoLog', logData);
    } catch (err) {
      this.log(err);
    }
  }

  getDeviceInformation() {
    let info = '';
    const devices = this.homey.drivers.getDriver('ac').getDevices();
    devices.forEach(device => {
      const data = JSON.stringify(device.getData(), null, 2);
      const store = JSON.stringify(device.getStore(), null, 2);
      const capablities = JSON.stringify(device.getCapabilities(), null, 2);
      info = `${`${info} ${device.getName()}`}\n Data: ${data}\n Store: ${store}\n\n Capabilities: ${capablities}\n\n`;
    });
    this.homey.settings.set('deviceInformation', info);
  }

  logStates(txt) {
    if (this.homey.settings.get('stateLogEnabled')) {
      const nowTime = new Date(Date.now());
      const log = `${`${this.homey.settings.get('stateLog') + nowTime.toJSON()} ${txt}`}\r\n`;
      if (log && (log.length > 30000)) {
        this.homey.settings.set('stateLogEnabled', false);
      } else {
        this.homey.settings.set('stateLog', log);
      }
    }
  }

  async sendLog(logType) {
    let tries = 5;
    while (tries-- > 0) {
      try {
        let subject = '';
        let text = '';

        if (logType === 'infoLog') {
          subject = 'Toshiba Information log';
          text = this.varToString(this.homey.settings.get('infoLog'));
        } else if (logType === 'stateLog') {
          subject = 'Toshiba state log';
          text = this.varToString(this.homey.settings.get('stateLog'));
        } else if (logType === 'deviceInformation') {
          subject = 'Toshiba device information';
          text = this.varToString(this.homey.settings.get('deviceInformation'));
        }

        subject += `(${this.homeyHash} : ${Homey.manifest.version})`;

        const response = send({ // Overriding default parameters
          from: `"Homey User" <${Homey.env.MAIL_USER}>`,
          user: Homey.env.MAIL_USER,
          pass: Homey.env.MAIL_SECRET,
          to: Homey.env.MAIL_USER,
          subject,
          text,
        });
        return {
          error: response.err,
          message: response.err ? null : 'OK',
        };
      } catch (err) {
        this.logInformation('Send log error', err);
        return {
          error: err,
          message: null,
        };
      }
    }
    return {
      message: 'Failed 5 attempts',
    };
  }

  varToString(source) {
    try {
      if (source === null) {
        return 'null';
      }
      if (source === undefined) {
        return 'undefined';
      }
      if (source instanceof Error) {
        const stack = source.stack.replace('/\\n/g', '\n');
        return `${source.message}\n${stack}`;
      }
      if (typeof (source) === 'object') {
        const getCircularReplacer = () => {
          const seen = new WeakSet();
          return (key, value) => {
            if (typeof value === 'object' && value !== null) {
              if (seen.has(value)) {
                return '';
              }
              seen.add(value);
            }
            return value;
          };
        };

        return JSON.stringify(source, getCircularReplacer(), 2);
      }
      if (typeof (source) === 'string') {
        return source;
      }
    } catch (err) {
      this.homey.app.updateLog(`VarToString Error: ${err}`, 0);
    }

    return source.toString();
  }

  hashCode(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h;
  }

}
module.exports = ToshibaACApp;
