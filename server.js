var settings = require('./settings');
var mosca = require('mosca');
var extend = require('node.extend');
var MongoClient = require('mongodb').MongoClient;

var baseNode = {
    clientId: '',
    topic:'',
    features: [],
    state: {},
    lastSeen: new Date()
};

var states = {
    nodes: {}
};

var connectedNodes = {};

function parsePacket(packet) {
    var ret = [];
    
    var data = packet.payload.toString();
    console.log(data);
    if (data.indexOf('{')==0 || data.indexOf('[')==0) {
        var obj = JSON.parse(data);
        console.log('packet as json',obj);
        ret = obj.length?obj:[obj];
    }
    else {
        console.log('packet as string',data);        
        data.split('\n').forEach(function(arrpart){    
            var row = {};
            arrpart.split(';').forEach(function(v) {
                //console.log('part',v);
                var pp = v.split('=');
                row[pp[0]] = pp[1];
            }, this);
            ret.push(row);
        });
    }
    return ret.length?ret:[ret];
}

function parseNode(n) {
    var ret = extend(baseNode,n);
    if (typeof(ret.features)=='string')
    {
        ret.features = [ret.features];
    }
    return ret;
}

function parseNodes(data,clientid) {
    data.forEach(function(n) {
        console.log(n);
        if (n.topic || n.features) {
            var ndata = parseNode(n);
            console.log('found node',ndata);
            if (ndata) {
                var url = ndata.topic||(settings.baseTopic+clientid);
                var node = states.nodes[url]||{};
                node.clientId = clientid;
                node.lastSeen = new Date();
                states.nodes[url] = extend(node,ndata);
            }
        }
    });
}

//parsePacket('{"states":{"item1":true}}');
//parsePacket('state=1');

var topicFunctions = {
    "init":function(packet,client) {
        var data = parsePacket(packet);
        //console.log(data);
        if (data && data.length)
            parseNodes(data,client.id);

        console.log('init',states);

        client.server.publish({
            topic:settings.baseTopic+"clientadded",
            payload:JSON.stringify(states),
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
        //console.log('Published',packet.topic);
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