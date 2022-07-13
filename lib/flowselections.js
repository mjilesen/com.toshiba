const Constants = require("./constants");
const Features = require("./ToshibaACFeatures");

exports.getModeResult=function( device ){
  const capability = device.getStoreValue( Constants.StoredCapabilityTargetACMode );
  const results = [[Constants.CapabilityTargetACMode1,[{id:Constants.Auto, name: Constants.Auto},
                                                      {id:Constants.Cool, name: Constants.Cool},
                                                      {id:Constants.Heat, name: Constants.Heat},
                                                      {id:Constants.Dry, name: Constants.Dry},
                                                      {id:Constants.Fan, name: Constants.Fan }]],
                   [Constants.CapabilityTargetACMode2,[{id:Constants.Heat, name: Constants.Heat}]],
                   [Constants.CapabilityTargetACMode3,[{id:Constants.Auto, name: Constants.Auto},
                                                      {id:Constants.Cool, name: Constants.Cool},
                                                      {id:Constants.Dry, name: Constants.Dry},
                                                      {id:Constants.Fan, name: Constants.Fan }]]
  ];
  const row = results.findIndex( row => row.includes( capability ))
  return results[ row ][1];
}

exports.getMeritAResult=function( device, acMode ){
  console.log( "acmode", acMode )
  const disabledValues = Features.disabledMeritAForMode.filter( function( row, index ){
    //console.log( acMode, row )
    return row[0]=== acMode
  });
    console.log( "disabled values A", disabledValues )

  const possibleValues = device.getStoreValue( Constants.StoredValuesMeritA ).filter( function( row, index ){
                          return !disabledValues.includes( row)
  } );
  return transformToAutocomplete( possibleValues )
}

exports.getMeritBResult=function( device, acMode ){
  console.log( "acmode", acMode )
  const disabledValues = Features.disabledMeritBForMode.find( element => element[0]=== acMode );
    console.log( "disabled values B", disabledValues )
  const possibleValues = device.getStoreValue( Constants.StoredValuesMeritB ).filter( function( row, index ){
                          return !disabledValues.includes( row)
  });
  return transformToAutocomplete( possibleValues )
}

function transformToAutocomplete( values ){
    let results = [];
    values.forEach( function( item, index){
      results.push( {id:item, name: item } )
    });
    return results;
};

exports.getSwingModeResult=function( device ){
  const capability = device.getStoreValue( Constants.StoredCapabilityTargetSwingMode );
  const results = [[Constants.CapabilityTargetSwingMode1,[{id:Constants.SwingMode_Off, name: Constants.SwingMode_Off},
                                                          {id:Constants.SwingMode_SwingVertical, name: Constants.SwingMode_SwingVertical},
                                                          {id:Constants.SwingMode_SwingHorizontal, name: Constants.SwingMode_SwingHorizontal},
                                                          {id:Constants.SwingMode_SwingVerticalAndHorizontal, name: Constants.SwingMode_SwingVerticalAndHorizontal},
                                                          {id:Constants.SwingMode_Fixed_1, name: Constants.SwingMode_Fixed_1 },
                                                          {id:Constants.SwingMode_Fixed_2, name: Constants.SwingMode_Fixed_2 },
                                                          {id:Constants.SwingMode_Fixed_3, name: Constants.SwingMode_Fixed_3 },
                                                          {id:Constants.SwingMode_Fixed_4, name: Constants.SwingMode_Fixed_4 },
                                                          {id:Constants.SwingMode_Fixed_5, name: Constants.SwingMode_Fixed_5 }]],
                   [Constants.CapabilityTargetSwingMode2,[{id:Constants.SwingMode_Off, name: Constants.SwingMode_Off},
                                                          {id:Constants.SwingMode_SwingVertical, name: Constants.SwingMode_SwingVertical}]],
                   [Constants.CapabilityTargetSwingMode3,[{id:Constants.SwingMode_Off, name: Constants.SwingMode_Off},
                                                          {id:Constants.SwingMode_SwingVertical, name: Constants.SwingMode_SwingVertical},
                                                          {id:Constants.SwingMode_SwingHorizontal, name: Constants.SwingMode_SwingHorizontal},
                                                          {id:Constants.SwingMode_SwingVerticalAndHorizontal, name: Constants.SwingMode_SwingVerticalAndHorizontal}]],
                   [Constants.CapabilityTargetSwingMode4,[{id:Constants.SwingMode_Off, name: Constants.SwingMode_Off},
                                                          {id:Constants.SwingMode_SwingVertical, name: Constants.SwingMode_SwingVertical},
                                                          {id:Constants.SwingMode_Fixed_1, name: Constants.SwingMode_Fixed_1 },
                                                          {id:Constants.SwingMode_Fixed_2, name: Constants.SwingMode_Fixed_2 },
                                                          {id:Constants.SwingMode_Fixed_3, name: Constants.SwingMode_Fixed_3 },
                                                          {id:Constants.SwingMode_Fixed_4, name: Constants.SwingMode_Fixed_4 },
                                                          {id:Constants.SwingMode_Fixed_5, name: Constants.SwingMode_Fixed_5 }]],
  ];
  const row = results.findIndex( row => row.includes( capability ))
  return results[ row ][1];
}

exports.getPowerModeResult=function(){
  const results = [{id:Constants.PowerSelection_power_none, name:Constants.PowerSelection_power_none},
                   {id:Constants.PowerSelection_power_50, name:Constants.PowerSelection_power_50},
                   {id:Constants.PowerSelection_power_75, name:Constants.PowerSelection_power_75},
                   {id:Constants.PowerSelection_power_100, name:Constants.PowerSelection_power_100}
                 ];
  return results
}

exports.getFanModeResult=function(){
  const results = [{id:Constants.FanMode_Auto, name:Constants.FanMode_Auto},
                   {id:Constants.FanMode_Quiet, name:Constants.FanMode_Quiet},
                   {id:Constants.FanMode_Low, name:Constants.FanMode_Low},
                   {id:Constants.FanMode_Medium_Low, name:Constants.FanMode_Medium_Low},
                   {id:Constants.FanMode_Medium, name:Constants.FanMode_Medium},
                   {id:Constants.FanMode_Medium_High, name:Constants.FanMode_Medium_High},
                   {id:Constants.FanMode_High, name:Constants.FanMode_High},
                 ];
  return results
}
