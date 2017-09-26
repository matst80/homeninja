var settings = require('./settings');
var mosca = require('mosca');
var extend = require('node.extend');
var MongoClient = require('mongodb').MongoClient;

var baseNode = {
    features: [],
    state: {},
    lastSeen: new Date()
};

var states = {
    nodes: {}
};
var connectedNodes = {};

function parsePacket(packet) {
    var data = packet.toString();
    if (data.indexOf('{')==0) {
        var obj = JSON.parse(data);
        console.log('packet as json',obj);
    }
    else {
        console.log('packet as string',data);
    }
}

parsePacket('{"states":{"item1":true}}');
parsePacket('ON');

var topicFunctions = {
    "init":function(packet,client) {
        console.log('init',states);
        parsePacket(packet);
        client.server.publish({
            topic:settings.baseTopic+"clientadded",
            payloaditems:JSON.stringify(states),
            qos: 0, // 0, 1, or 2
            retain: false // or true
        },function(){
            console.log('init packet sent');
        });
    }
};

// Use connect method to connect to the Server 
MongoClient.connect(settings.mongoPersistanceUrl, function(err, db) {

    var server = new mosca.Server(settings.mqttSettings);

    // fired when a message is received
    server.on('published', function(packet, client) {
        //packet.topic
        console.log('Published',packet.topic);
        for(var topic in topicFunctions) {
            console.log(settings.baseTopic+topic);
            if (String(settings.baseTopic+topic)==String(packet.topic)) {
                console.log('found func',topic);
                topicFunctions[topic](packet,client,server);
            }
        }
    });

    server.on('clientConnected', function(client) {
        console.log('client connected', client.id);
        
    });

    server.on('clientDisconnected',function(client) {
        console.log('client disconnected', client.id);
    });

    

    server.on('ready', function(){
        console.log('Waiting for connections');
    });

    //console.log("Connected correctly to server");
    //db.close();
});