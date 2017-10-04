var settings = require("./settings"),
homeninja = require("../nodehelper/nodehelper").init(settings);

const HomeKit = require('homekit');
const Accessory      = HomeKit.Accessory;
const Service        = HomeKit.Service;
const Characteristic = HomeKit.Characteristic;
const UUID           = HomeKit.uuid;

// Start by creating our Bridge which will host all loaded Accessories
const uuid = HomeKit.uuid.generate("homekit:homeninja");
const bridge = new HomeKit.Bridge('Homeninja', uuid);

// Listen for bridge identification event
bridge.on('identify', function(paired, callback) {
  console.log("%s Identify!", bridge.displayName);
  callback(); // success
});
bridge.on('listening', function(){
  homeninja.on('connect',function() {
    //sendDevices();
    console.log('connected');
    homeninja.getNodes(function(nodes) {
      //console.log('nodes',nodes);
      nodes.forEach(function(elm) {
        if (elm.name && elm.features && elm.features.indexOf('onoff')!=-1) {
          
          var uuid = UUID.generate('homekit:'+elm.name);
          // This is the Accessory that we'll return to HAP-NodeJS that represents our light.
          var accessory = new Accessory('Light', uuid);
          accessory.getService(Service.AccessoryInformation)
          .setCharacteristic(Characteristic.Manufacturer, "Oltica")
          .setCharacteristic(Characteristic.Model, "Rev-1")
          //.setCharacteristic(Characteristic.SerialNumber, "A1S2NASF88EW");

          accessory.on('identify', function(paired, callback) {
            console.log("Identify the '%s'", this.name);
            callback();
          });
            //callback();
          accessory
            .addService(Service.Lightbulb, elm.name) // services exposed to the user should have "names" like "Light" for this case
            .getCharacteristic(Characteristic.On)
            .on('set', function(value, callback) {
              console.log('set state',value,elm);
              homeninja.sendState(elm,value?'on':'off');
              callback();
            }).on('get', function(callback) {
              callback(null, true);
            });
          accessory
            .getService(Service.Lightbulb)
            .addCharacteristic(Characteristic.Brightness)
            .on('set', function(value, callback) {
              //LightController.setBrightness(value);
              console.log('set state (value)',value,elm);
              console.log('set value');
              callback();
            })
            .on('get', function(callback) {
              callback(null, 50);
            });
          
          
            console.log('add to bridge',elm);
          bridge.addBridgedAccessory(accessory);
          
          // Publish the Accessory on the local network. 
          
        }
      });
    });
  });


  console.log("HomeKit Server starting...");
});

// Publish the Bridge on the local network.
bridge.publish({
  port: 51826,
  username: "CC:22:3D:E3:CA:F9",
  pincode: "123-45-678",
  category: HomeKit.Accessory.Categories.BRIDGE
});