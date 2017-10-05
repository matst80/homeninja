var settings = require('./settings'),
    extend = require('node.extend'),
    MongoClient = require('mongodb').MongoClient,
    //jsonfile = require('jsonfile');
    baseServer = require('./baseserver')(settings),
    vm = require('vm');

var dbCache = {},
    baseNode = {
        clientId: '',
        topic:'',
        features: [],
        state: {},
        lastSeen: new Date()
    },
    states = {
        nodes: {},
        rules: {}
    },
    ruleScripts = {};

//var connectedNodes = {};

function saveStates() {
    /*MongoClient.connect(settings.mongoPersistanceUrl, function(err,db) {
        if (err) throw err;
        console.log("Connected to Database");
    
        // insert record
        db.collection('laststates').insert(states, function(err, records) {
            if (err) throw err;
            console.log("Record added as " + records);
        });
    });*/
    console.log('save states!!!');
}

function parsePacket(packet) {
    var ret = [];
    
    var data = packet.payload.toString();
    //console.log(data);
    if (data.indexOf('{')==0 || data.indexOf('[')==0) {
        var obj = JSON.parse(data);
        //console.log('packet as json',obj);
        ret = obj.length?obj:[obj];
    }
    else {
        //console.log('packet as string',data);        
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

var stateTimeout;
function statesChanged() {
    if (stateTimeout)
        clearTimeout(stateTimeout);
    stateTimeout = setTimeout(saveStates,1000);
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
    var ret = [];
    data.forEach(function(n) {
        //console.log(n);
        if (n.topic || n.features) {
            var ndata = parseNode(n);
            //console.log('found node',ndata);
            if (ndata) {
                var url = ndata.topic||(settings.baseTopic+clientid);
                var node = states.nodes[url]||{};
                node.clientId = clientid;
                node.lastSeen = new Date();
                var changed = ndoe.state!=ndata.state;
                var nn = extend(ndata,node);
                if (settings.customization && settings.customization[url]) {
                    nn = extend(nn,settings.customization[url]);
                }
                states.nodes[url] = nn;
                if (changed)
                    ret.push(nn);
            }
        }
    });
    return ret;
    statesChanged();
}

baseServer.addTopicHandler("nodeupdate",function(packet,client) {
    var data = parsePacket(packet);
    console.log('preinit',client.id);
    if (data && data.length) {

    
        var updatedNodes = parseNodes(data,String(client.id));

        console.log('init',states);

        baseServer.mqttServer.publish({
            topic:settings.baseTopic+"nodechange",
            payload:JSON.stringify(updatedNodes),
            qos: 0, // 0, 1, or 2
            retain: false // or true
        },function(){
            console.log('init packet sent');
        });
    }
});


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

const contextSandbox = {
    homeninja: baseServer,
    log: function(a,b) {
        console.log.apply(this,arguments); 
    }
}
const context = new vm.createContext(contextSandbox);

function addRule(id,title,data) {
    var scr = new vm.Script(data,{filename:id+'.js',displayErrors:true});
    scr.runInContext(context);
    var ret = state.rules[id] = {
        id: id,
        title: title,
        //scrtip: scr,
        rule: data
    };
    ruleScripts[id] = scr;
    statesChanged();
    return ret;
}

baseServer.addApiHandler("rule",function(req,cb) {
    var obj = JSON.parse(req.data);
    addRule(obj.id,obj.name,obj.rule);
    cb({ok:true});
})

baseServer.addApiHandler("save", function(req,cb) {
    
    dbCache[req.params[0]] = JSON.parse(req.data);
    //console.log(req.params);
    cb({"ok":true});
});

function toArray(obj) {
    var ret = [];
    for(i in obj) {
        ret.push(obj[i]);
    }
    return ret;
}

baseServer.addApiHandler("node", function(req,cb) {
    
    cb(toArray(states.nodes));
});

baseServer.addApiHandler("sendstate", function(req,cb) {
    var data = JSON.parse(req.data);
    baseServer.mqttServer.publish({
        topic:data.topic,
        payload:data.state,
        qos: 0, // 0, 1, or 2
        retain: false // or true
    },function(){
        cb(true);
    });
});

baseServer.addApiHandler("load",function(req,cb){
    var obj = dbCache[req.params[0]];
    cb(obj?obj:{});
});
