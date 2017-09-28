var hue = require("node-hue-api");
var settings = require("./settings");
var homeninja = require("../nodehelper/nodehelper").init(settings);
var lightState = hue.lightState;
var baseApi = new hue.HueApi();
var bridges = settings.bridges;
var apiCache = {};

function isEmptyObject(obj) {
    for(var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        return false;
      }
    }
    return true;
  }

homeninja.on('connect',function() {
    homeninja.load(settings.bridgeConfigKey,function(data) {
        if (!isEmptyObject(data))
            bridges = data;
        
        findBridges(function() {
            console.log('bridge found, saving');
            homeninja.save(settings.bridgeConfigKey,bridges,function(d){
                console.log(d);
            });
        });
    });
    homeninja.client.subscribe('homehue/+/+/set');
});

function getApi(bridge) {
    var api = apiCache[bridge.id];
    if (!api) {
        console.log('init new api',bridge.ip);
        api = new hue.HueApi(bridge.ip, bridge.username);
    }
    apiCache[bridge.id] = api;
    return api;
}

homeninja.client.on('message', function (topic, msg) {
    // message is Buffer
    var message = msg.toString();
    console.log(topic,message);
    for(bridgeId in bridges) {
        var bridge = bridges[bridgeId];
        for(var nodeIdx in bridge.nodes) {
            var node = bridge.nodes[nodeIdx];
            if (topic.startsWith(node.topic)) {
                var api = getApi(bridge);
                var level = message-0;
                state = lightState.create();
                if (message==level) {
                    state = state.on().brightness(level);
                }
                else {
                    state = (message=='on')?state.on():state.off();
                }
                api.setLightState(node.hueid, state, function(err, result) {
                    if (err) throw err;
                    homeninja.client.publish(node.topic+'state',state);
                });
            };
        }
    }
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
            }
            else {
                console.log('found configured bridge');
                var oldbridge = bridges[b.id];
                var newdevices = [];
                oldbridge.ip = b.ipaddress;
                getApi(oldbridge).fullState(function(err, config) {
                    if (err) throw err;
                    var lst = config.lights;
                    
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
                            topic: 'homehue/'+b.id+'/'+lightid
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
                });
            }
            
        }, this)}
    ).done();
}