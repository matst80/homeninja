var tradfri = require("tradfri-coapdtls");
var settings = require("./settings");
var homeninja = require("../nodehelper/nodehelper").init(settings);
var common = require("../common/index");
var tradfriHub = new tradfri(settings.hubSettings);
var devices = [];

homeninja.on('connect',function() {
   
        findBridges(function() {
            console.log('bridge found, saving');
            homeninja.save(settings.bridgeConfigKey,bridges,function(d){
                console.log(d);
            });
        });
   
    homeninja.client.subscribe(settings.baseTopic+'+/set');
});

// function getApi(bridge) {
//     var api = apiCache[bridge.id];
//     if (!api) {
//         console.log('init new api',bridge.ip);
//         api = new hue.HueApi(bridge.ip, bridge.username);
//     }
//     apiCache[bridge.id] = api;
//     return api;
// }

homeninja.client.on('message', function (topic, msg) {
    // message is Buffer
    var message = msg.toString();
    console.log(topic,message);
    
    common.findNode(topic,devices,function(node) {
        
        let level = message-0;
        let state = 1;
        let time = 2;
        
        if (message==level) {
            if (level==0)
                state = 0;
            time = 1;
            //console.log('brightness');
        }
        else {
            //level = 254;
            state = (message=='on')?1:0;
            level = state?254:0;
        }
        var send = {
            state: state,
            brightness: level
          };
        console.log('update',node.id,send);
        //tradfriHub.connect().then( function(val) {
            tradfriHub.setDevice(node.id, send,2).then(function(res) {
                console.log(res);
                homeninja.client.publish(node.topic+'/state',level.toString());
                console.log("New value send to device");
            }).catch(function(err) {
                console.log('catch',err);
            });
        //});
    });
});

function notifyError(err) {
    homeninja.sendNotification('Press bridge button to bind');
    console.log("Fail",err.message);
    //client.publish('homeninja/notify','Press hue bridge button');
};

function findBridges(onBridgeFound) {
    console.log('connecting to hub');
    
    
    tradfriHub.connect().then( function(val) {
        console.log(val);
        tradfriHub.getAllDevices().then(function(res) {
            //console.log(res);
            devices = res.map(function(i) {
                console.log('device',i);
                return {
                    topic:settings.baseTopic+i['9003'],
                    name:i['9001'],
                    id:i['9003'],
                    state: {},
                    features: ['lighttemp','brightness']
                }
            });
            homeninja.sendNodes(devices);
        });
        tradfriHub.getGatewayInfo().then( function(res) {
            console.log('Version:',res['9029']);
        }).catch( function(error) {
            console.log ("Gateway is not reachable!")
        });
    });
}