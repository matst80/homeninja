var telldus = require('telldus');
var settings = require("./settings");
var homeninja = require("../nodehelper/nodehelper").init(settings);
var common = require("../common/index");

var nodes = [];

var tempTimeout;

function getState(tddata) {
    var ret = 'off';
    if (tddata && tddata.name)
        ret = tddata.name=='ON'?'on':'off';
}

function getSensors() {
    telldus.getSensors(function(err,sensors) {
        homeninja.sendNodes(sensors.map(function(v) {
            
            //console.log(v);
            homeninja.client.publish('telldus/sensor',JSON.stringify(v));
            return {
                topic: "telldus/sens"+v.id,
                type: 'temp',
                name: 'temp'+v.id+': '+v.data[0].value,
                features: ['temp','hum'],
                state: {
                    temp:v.data[0].value,
                    hum:v.data[1].value
                }
            };
        }));
        tempTimeout = setTimeout(function() {
            getSensors();
        }, settings.tempInterval||10000);
    });
}

function getNodes() {
    
    telldus.getDevices(function(err,devices) {
        if (err)
        throw err;
        nodes = homeninja.sendNodes(devices.map(function(v) {
            var features = ['onoff'];
            if (v.methods.indexOf('LEARN')!=-1)
                features.push('learn');
            if (v.methods.indexOf('DIMMER')!=-1)
                features.push('brightness');
            console.log(v);
            return {
                tdid: v.id,
                name: v.name,
                state: getState(v.status),
                features: features,
                topic: "telldus/conf"+v.id
            };
        }));
        homeninja.sendNodes(nodes);
        if (tempTimeout)
            clearTimeout(tempTimeout);
        getSensors();
        
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

var listener = telldus.addRawDeviceEventListener(function(controllerId, data) {
    console.log('Raw device event: ' + data);
    homeninja.client.publish('telldus/raw',JSON.stringify(toObj(data)));
});

var listener = telldus.addRawDeviceEventListener(function(controllerId, data) {
    console.log('Raw device event: ' + data);
    homeninja.client.publish('telldus/raw',JSON.stringify(toObj(data)));
});

var devlistener = telldus.addDeviceEventListener(function(deviceId, status) {
    common.findNode('/elldus/conf'+deviceId,nodes,function(elm) {
        elm.state = status;
        homeninja.updateNodes([elm]);
    });
    console.log('Device ' + deviceId + ' is now ' + status.name);
});

homeninja.on('connect',function() {    
    getNodes();
    homeninja.client.subscribe("telldus/+/set");
    
});

homeninja.client.on('message', function (topic, msg) {
    // message is Buffer
    var message = msg.toString();
    //console.log(topic,message,nodes);
    common.findNode(topic,nodes,function(node) {
        console.log('turning',node,message);        
	var on = (message=="on");
	telldus[on?'turnOn':'turnOff'](node.tdid,function(err) {
            console.log('deviceId is now ',message);
            homeninja.sendState(node,message);
            homeninja.updateNodes([node]);
            //homeninja.client.publish(node.topic+'/state',message);
        });
    });
});

