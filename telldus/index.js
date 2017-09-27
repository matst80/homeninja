
var telldus = require('telldus');
var settings = require("./settings");
//var client  = mqtt.connect('mqtt://10.10.10.181');
var homeninja = require("homeninja-nodehelper").init(settings);

var alldevices = [];

function getNodes() {
    telldus.getDevices(function(err,devices) {
             var alldevices = [];
     
     
             if ( err ) {
                 console.log('Error: ' + err);
             } else {
                 
                 for(var i in devices)
                 {
                     var v = devices[i];
                     //console.log(v);
                     var topic = "telldus/conf"+v.id;
                    //  if (i==1){
                    //      client.subscribe(topic);
                    //      console.log(topic);
                    //  }
                 
                     alldevices.push({ 
                        tdid:v.id,
                        name:v.name,
                        features:v.methods,
                        topic:topic
                    });
                     
                 }
                 console.log('found',alldevices.length);
                 homeninja.sendNodes(alldevices);
             }
         });
}

homeninja.on('connect',function() {
    getNodes();
});
 
homeninja.client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic,message.toString());
    alldevices.forEach(function(node){
        if (topic==node.topic)
        {
            console.log('found node');
            telldus.turnOn(node.tdid,function(err) {
                console.log('deviceId is now ON');
              });
        }
    });
  //client.end()
})

