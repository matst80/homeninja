
var telldus = require('telldus');
var settings = require("./settings");
var homeninja = require("../nodehelper/nodehelper").init(settings);
var common = require("../common/index");

var nodes = [];

function getNodes() {
    telldus.getDevices(function(err,devices) {
        if (err)
            throw err;
        homeninja.sendNodes(devices.map(function(v) {
            console.log(v);
            return { 
                tdid: v.id,
                name: v.name,
                features: v.methods,
                topic:"telldus/conf"+v.id
            };
        }));
    });
    telldus.getSensors(function(err,sensors) {
        sensors.map(function(v) {
            console.log(v);
            homeninja.client.publish('telldus/sensor',JSON.stringify(v));
        });
    });
}

function toObj(data) {
    var ret = {};
    data.split(';').map(function(kv) {
        var pp = kv.split(':');
        if (pp.length>0) {
            ret[pp[0]] = pp[1]||'';
        }
    });
    return ret;
}

homeninja.on('connect',function() {
    getNodes();
    homeninja.client.subscribe("telldus/+/set");
    var listener = telldus.addRawDeviceEventListener(function(controllerId, data) {
        console.log('Raw device event: ' + data);
        homeninja.client.publish('telldus/raw',JSON.stringify(toObj(data)));
    });
});
 
homeninja.client.on('message', function (topic, msg) {
    // message is Buffer
    var message = msg.toString();
    console.log(topic,message);
    common.findNode(topic,nodes,function(node) {
        var on = (message=="on");
        telldus[on?'turnOn':'turnOff'](node.tdid,function(err) {
            console.log('deviceId is now ON');
            homeninja.client.publish(node.topic+'/state',message);
        });
    });
});

