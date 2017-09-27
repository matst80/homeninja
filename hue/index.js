//var mqtt = require('mqtt');
var hue = require("node-hue-api");
var settings = require("./settings");
//var client  = mqtt.connect('mqtt://10.10.10.181');
var homeninja = require("../nodehelper/nodehelper").init(settings);

var baseApi = new hue.HueApi();
var bridges = settings.bridges;

function isEmptyObject(obj) {
    for(var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        return false;
      }
    }
    return true;
  }

homeninja.on('connect',function() {
    //console.log('connected',homeninja);
    homeninja.load(settings.bridgeConfigKey,function(data) {
        //console.log('got data',data,data);
        if (!isEmptyObject(data))
            bridges = data;
        findBridges(function() {
            console.log('bridge found, save');
            homeninja.save(settings.bridgeConfigKey,bridges,function(d){
                console.log(d);
            });
        });
    }); 
});

function notifyError(err) {
    homeninja.sendNotification('Press hue bridge button to bind');
    console.log("Fail",err);
    //client.publish('homeninja/notify','Press hue bridge button');
};

function findBridges(onBridgeFound) {


    hue.nupnpSearch().then(function(bridge) {
        

        bridge.forEach(function(b) {
            console.log('Found bridge:',b.ipaddress);
            if (!bridges[b.id]) {
                
                let newbridge = {
                    //devices:newdevices,
                    ip: b.ipaddress,
                    id: b.id,
                    version:0,
                    hasuser:false
                };
                console.log('connecting to',b.ipaddress);
                baseApi.registerUser(b.ipaddress, 'Home ninja API')
                    .then(function(res){
                        console.log('got user',res);
                        newbridge.username = res.username;
                    })
                    .fail(notifyError)
                    .done();
                //api.config().then(displayResult).done();
                
            }
            else {
                console.log('found configured bridge');
                var oldbridge = bridges[b.id];
                var newdevices = [];
                oldbridge.ip = b.ipaddress;
                let newapi = new hue.HueApi(b.ipaddress, oldbridge.username);
                // newapi.config(function(err, config) {
                //     if (err) throw err;
                //     //console.log(config);
                //     oldbridge.config = config;
                // });
                newapi.fullState(function(err, config) {
                    if (err) throw err;
                    var lst = config.lights;
                    //oldbridge.states = config.states;
                    //console.log(config.lights);
                    for(var lightid in lst) {
                        var v = lst[lightid];
                        //console.log(v);
                        var row = { 
                            hueid: lightid,
                            uniqueid: v.uniqueid,
                            modelid: v.modelid,
                            state: v.state,
                            name: v.name,
                            features: [v.type],
                            topic: 'homehue/'+lightid
                        };
                        //console.log('row created',row);
                        newdevices.push(row);
                    }
                    oldbridge.nodes = newdevices;
                    bridges[b.id] = oldbridge;
                    console.log('sending');
                    homeninja.sendNodes(newdevices);
                    console.log('found',newdevices.length,', sent');
                    if (onBridgeFound)
                        onBridgeFound(oldbridge);
                    
                    /*client.publish('homeninja/init',String(JSON.stringify(newdevices)),{},function() {
                        console.log('sent');
                    });
                    */

                });
                //apis[b.id] = newapi;
            }
            
        }, this)}
).done();

var displayUserResult = function(result) {
    console.log("Created user: " + JSON.stringify(result));
};

 


}