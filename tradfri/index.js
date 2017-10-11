var tradfri = require("tradfri-coapdtls");
var settings = require("./settings");
var homeninja = require("../nodehelper/nodehelper").init(settings);
var common = require("../common/index");
var tradfriHub = new tradfri(settings.hubSettings);
var devices = [];
var isConnected;

homeninja.on('connect',function() {
   if(!isConnected)
        findBridges(function() {
            console.log('bridge found, saving');
            homeninja.save(settings.bridgeConfigKey,bridges,function(d){
                console.log(d);
            });
        });
    else
        homeninja.sendNodes(devices);
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
    var send = JSON.parse(msg.toString());
    console.log(topic,send);
    
    common.findNode(topic,devices,function(node) {
        
        
        console.log('update',node.id,send);
        //tradfriHub.connect().then( function(val) {
            tradfriHub.setDevice(node.id, send,2).then(function(res) {
                console.log(res);
                homeninja.sendState(node,send.brightness.toString());
                node.state = send;
                //homeninja.client.publish(node.topic+'/state',JSON.stringify(send));
                homeninja.updateNodes([node]);
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
        isConnected = true;
        console.log(val);
        tradfriHub.getAllDevices().then(function(res) {
            //console.log(res);
            devices = res.map(function(i) {
                console.log('device',i);
                var st = i["3311"];
                if (st) 
                    return {
                        topic:settings.baseTopic+i['9003'],
                        name:i['9001'],
                        id:i['9003'],
                        state: {
                            brightness: st[0]["5851"],
                            state: st[0]["5850"]
                        },
                        features: ['lighttemp','brightness','onoff']
                    }
                return {
                    topic:settings.baseTopic+i['9003'],
                    name:i['9001'],
                    id:i['9003'],
                    state: false,
                    features: ['remote']
                }
                
            });
            console.log('sending',devices);
            homeninja.sendNodes(devices);
        });
        tradfriHub.getGatewayInfo().then( function(res) {
            console.log('Version:',res['9029']);
        }).catch( function(error) {
            console.log ("Gateway is not reachable!")
        });
    });
}