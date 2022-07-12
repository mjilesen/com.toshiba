const Constants = require("./constants");

exports.setCapabilities= async function( device ){
  const meritFeature = device.getData( Constants.DataMeritFeature );
  const type = device.getData( Constants.DataACModelID );

  const merit_bit1 = getBit( meritFeature, 1 );
  const merit_bit2 = getBit( meritFeature, 2 );
  const merit_bit3 = getBit( meritFeature, 3 );
  const merit_bit4 = getBit( meritFeature, 4 );
  const merit_bit5 = getBit( meritFeature, 5 );
  const merit_bit6 = getBit( meritFeature, 6 );
  const merit_bit7 = getBit( meritFeature, 7 );
  const merit_bit14 = getBit( meritFeature, 14 );
  const merit_bit15 = getBit( meritFeature, 15 );

  await determinACMode( device, merit_bit6, merit_bit7 );
  await determinSwingMode(device, merit_bit1, merit_bit14, type );
}

function getBit( number, bitPosition){
  return ( number & ( 1 << bitPosition )) === 0?false:true;
}

async function determinACMode( device, bit6, bit7 ){
  let name = Constants.CapabilityTargetACMode1
  if ( !bit6 && bit7 ){
    name = Constants.CapabilityTargetACMode2;
  } else if ( bit6 && !bit7 ){
    name = Constants.CapabilityTargetACMode3;
  }
  await addCapabilityToDevice( device, Constants.StoredCapabilityTargetACMode, name );
}

async function determinSwingMode( device, bit1, bit14, type ){
  let name = Constants.CapabilityTargetSwingMode2;

  if ( type === "2" ){
    if( bit1 ){
      name = Constants.CapabilityTargetSwingMode3;
    }
  } else if ( type==="3"){
    if( bit1 && bit14){
      name = Constants.CapabilityTargetSwingMode1;
    } else if( bit1){
      name = Constants.CapabilityTargetSwingMode3;
    }
    else if ( bit14){
      name = Constants.CapabilityTargetSwingMode4;
    }
  }
  await addCapabilityToDevice( device, Constants.StoredCapabilityTargetSwingMode, name );
}

async function addCapabilityToDevice( device, type, name ){
  await device.addCapability( name );
  await device.setStoreValue(  type, name );
  //add listener
  device.registerCapabilityListener( name, async (value, opts) => {
     await device.setCapabilityValue( name, value );
     await device.updateStateAfterUpdateCapability( false );
  });
}
