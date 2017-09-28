
var telldus = require('telldus');
var settings = require("./settings");
var homeninja = require("../nodehelper/nodehelper").init(settings);

var alldevices = [];

function getNodes() {
    telldus.getDevices(function(err,devices) {
        alldevices = [];

        if (err) {
            console.log('Error: ' + err);
        } else {
            for(var i in devices) {
                var v = devices[i];
            
                alldevices.push({ 
                    tdid:v.id,
                    name:v.name,
                    features:v.methods,
                    topic:"telldus/conf"+v.id
                });
                
            }
            console.log('found',alldevices.length);
            homeninja.sendNodes(alldevices);
		    console.log('sent'); 
        }
    });
}

homeninja.on('connect',function() {
    getNodes();
    homeninja.client.subscribe("telldus/+/state");
});
 
homeninja.client.on('message', function (topic, msg) {
    // message is Buffer
    var message = msg.toString();
    console.log(topic,message);
    alldevices.forEach(function(node) {
	
        if (topic.startsWith(node.topic))
        {
            console.log('found node',message);
	        var on = (message=="on");
            if (on) {
	            telldus.turnOn(node.tdid,function(err) {
                    console.log('deviceId is now ON');
                });
            }
            else {
                telldus.turnOff(node.tdid,function(err) {
                    console.log('deviceId is now OFF');
                });
            }
        }
    });
});

