var settings = require("./settings"),
homeninja = require("../nodehelper/nodehelper").init(settings);

const HomeKit = require('homekit');
const Accessory      = HomeKit.Accessory;
const Service        = HomeKit.Service;
const Characteristic = HomeKit.Characteristic;
const UUID           = HomeKit.uuid;

// Start by creating our Bridge which will host all loaded Accessories
const uuid = HomeKit.uuid.generate("homekit:bridge:demo");
const bridge = new HomeKit.Bridge('My Bridge', uuid);

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
      console.log('nodes',nodes);
      nodes.forEach(function(elm) {
        if (elm.name) {
          
          var uuid = UUID.generate('homekit:light');
          // This is the Accessory that we'll return to HAP-NodeJS that represents our light.
          var accessory = new Accessory('Simple Light', uuid);

          accessory.on('identify', function(paired, callback) {
            console.log("Identify the '%s'", this.name);
            //callback();
          accessory
            .addService(Service.Lightbulb, elm.name) // services exposed to the user should have "names" like "Light" for this case
            .getCharacteristic(Characteristic.On)
            .on('set', function(value, callback) {
              console.log('set state',value,elm);
              homeninja.sendState(elm,value?'on':'off');
              callback();
            }).on('get', function(callback) {
              callback(null, false);
            });

          });
          
          
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
  username: "CC:22:3D:E3:CE:F7",
  pincode: "123-45-678",
  category: HomeKit.Accessory.Categories.BRIDGE
});