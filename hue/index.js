var hue = require("node-hue-api");
var settings = require("./settings");
var homeninja = require("../nodehelper/nodehelper").init(settings);
var common = require("../common/index");
var lightState = hue.lightState;
var baseApi = new hue.HueApi();
var bridges = settings.bridges;
var apiCache = {};

homeninja.on('connect',function() {
    homeninja.load(settings.bridgeConfigKey,function(data) {
        if (!common.isEmptyObject(data))
        console.log('users',bridges,data);
            //bridges = data;
        
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
        //console.log('nodes',bridge.devices);
        common.findNode(topic,bridge.devices,function(node) {
            let api = getApi(bridge);
            let level = message-0;
            state = lightState.create();
            if (message==level) {
                state = state.on().brightness(level);
            }
            else {
                state = (message=='on')?state.on():state.off();
            }
            console.log('set state',node,state);
            api.setLightState(node.hueid, state, function(err, result) {
                if (err) throw err;
                console.log('state is SET');
                homeninja.sendState(node,message);
            });
        });
    }
});

function notifyError(err) {
    homeninja.sendNotification('Press hue bridge button to bind');
    console.log("Fail",err.message);
    //client.publish('homeninja/notify','Press hue bridge button');
};

function findBridges(onBridgeFound) {
    hue.nupnpSearch().then(function(bridgeList) {
        //let bridgeArray = 
        bridgeList.map(function(b) {
            
            var existing = bridges[b.id];
            var ret = existing||{
                devices: [],
                id: b.id,
                found: new Date()
            };
            ret.ip = b.ipaddress;
            //console.log('här',ret);
            if (!existing) {
                baseApi.registerUser(b.ipaddress, 'Home ninja API')
                    .then(function(res){
                        console.log('got user',res);
                        b.username = b.username;
                    }).fail(notifyError).done();
            }
            else 
                getApi(ret).fullState(function(err, config) {
                    if (err) throw err;
                    ret.devices = common.each(config.lights,function(v,i) {
                        return { 
                            hueid: i,
                            uniqueid: v.uniqueid,
                            modelid: v.modelid,
                            state: v.state,
                            name: v.name,
                            features: ['onoff','brightness'],
                            topic: common.pathJoin(settings.baseTopic,b.id,i)
                        };
                    });
                    homeninja.sendNodes(ret.devices);
                    if (onBridgeFound)
                        onBridgeFound(ret);
                        
                });
                bridges[ret.id] = ret;
            return ret;
        });
    }).done();
}