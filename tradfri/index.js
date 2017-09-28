var tradfri = require("tradfri-coapdtls");
var settings = require("./settings");
var homeninja = require("../nodehelper/nodehelper").init(settings);
var common = require("../common/index");


homeninja.on('connect',function() {
    homeninja.load(settings.bridgeConfigKey,function(data) {
        if (!common.isEmptyObject(data))
            bridges = data;
        
        findBridges(function() {
            console.log('bridge found, saving');
            homeninja.save(settings.bridgeConfigKey,bridges,function(d){
                console.log(d);
            });
        });
    });
    homeninja.client.subscribe('tradfri/+/+/set');
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
    for(bridgeId in bridges) {
        var bridge = bridges[bridgeId];
        common.findNode(function(node) {
            let api = getApi(bridge);
            let level = message-0;
            state = lightState.create();
            if (message==level) {
                state = state.on().brightness(level);
            }
            else {
                state = (message=='on')?state.on():state.off();
            }
            api.setLightState(node.hueid, state, function(err, result) {
                if (err) throw err;
                homeninja.sendState(node,state);
            });
        });
    }
});

function notifyError(err) {
    homeninja.sendNotification('Press bridge button to bind');
    console.log("Fail",err.message);
    //client.publish('homeninja/notify','Press hue bridge button');
};

function findBridges(onBridgeFound) {
    tradfriHub = new tradfri(settings.hubSettings);
    tradfriHub.connect().then( function(val) {
        console.log(val);
        tradfriHub.getGatewayInfo().then( function(res) {
            console.log(res);
        }).catch( function(error) {
            console.log ("Gateway is not reachable!")
        });
    });
    // hue.nupnpSearch().then(function(bridgeList) {
    //     //let bridgeArray = 
    //     bridgeList.map(function(b) {
            
    //         var existing = bridges[b.id];
    //         var ret = existing||{
    //             devices: [],
    //             id: b.id,
    //             found: new Date()
    //         };
    //         ret.ip = b.ipaddress;
    //         //console.log('här',ret);
    //         if (!existing) {
    //             baseApi.registerUser(b.ipaddress, 'Home ninja API')
    //                 .then(function(res){
    //                     console.log('got user',res);
    //                     b.username = b.username;
    //                 }).fail(notifyError).done();
    //         }
    //         else 
    //             getApi(ret).fullState(function(err, config) {
    //                 if (err) throw err;
    //                 ret.devices = common.each(config.lights,function(v,i) {
    //                     return { 
    //                         hueid: i,
    //                         uniqueid: v.uniqueid,
    //                         modelid: v.modelid,
    //                         state: v.state,
    //                         name: v.name,
    //                         features: [v.type],
    //                         topic: common.pathJoin(settings.baseTopic,b.id,i)
    //                     };
    //                 });
    //                 homeninja.sendNodes(ret.devices);
    //                 if (onBridgeFound)
    //                     onBridgeFound(ret);
                        
    //             });
    //             bridges[ret.id] = ret;
    //         return ret;
    //     });
    // }).done();
}