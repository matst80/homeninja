var settings = require('./settings');

var extend = require('node.extend');
var MongoClient = require('mongodb').MongoClient;

var baseServer = require('./baseserver')(settings);

var dbCache = {};

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

function saveStates() {

}

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
        //console.log(n);
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


baseServer.addTopicHandler("init",function(packet,client) {
    var data = parsePacket(packet);
    console.log('preinit',client.id);
    if (data && data.length)
        parseNodes(data,String(client.id));

    console.log('init',states);

    baseServer.mqttServer.publish({
        topic:settings.baseTopic+"clientadded",
        payload:JSON.stringify(states),
        qos: 0, // 0, 1, or 2
        retain: false // or true
    },function(){
        console.log('init packet sent');
    });
});

baseServer.addApiHandler("save", function(req,cb) {
    
    dbCache[req.params[0]] = JSON.parse(req.data);
    //console.log(req.params);
    cb({"ok":true});
});

baseServer.addApiHandler("load",function(req,cb){
    var obj = dbCache[req.params[0]];
    cb(obj?obj:{});
});
