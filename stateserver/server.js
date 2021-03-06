var settings = require('./settings'),
    extend = require('node.extend'),
 //   MongoClient = require('mongodb').MongoClient,
    jsonfile = require('jsonfile');
    baseServer = require('./baseserver')(settings),
    vm = require('vm');

var dbCache = {},
    baseNode = {
        clientId: '',
        topic:'',
        features: [],
        //state: {},
        lastSeen: new Date()
    },
    states = {
        nodes: {},
        rules: {},
        customization: {}
    },
    ruleScripts = {};

jsonfile.readFile('./states.json',function(err,obj) {
    if (!err)
    {
        states = obj;
        states.nodes = {};
//        states.customization = {};
    }
});

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
    jsonfile.writeFileSync('./states.json',states);
    console.log('save states!!!');
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

function hasChange(a,b) {
    if (a.state!=b.state)
        return true;
    if (a.name!=b.name) {
        return true;
    }
    if (a.desciption!=b.desciption) {
        return true;
    }
    return false;
}

function parseNodes(data,clientid) {
    var ret = [];
    data.forEach(function(n) {
        //console.log('checkchange',n);
		
        if (n && (n.topic || n.features)) {
            var ndata = parseNode(n);
            //console.log('found node',ndata);
            if (ndata) {
                var url = ndata.topic||(settings.baseTopic+clientid);
                var node = states.nodes[url]||{};
                if (clientid)
                    node.clientId = clientid;
                var changed = hasChange(node,ndata);
                extend(node,ndata);
                if (states.customization && states.customization[url]) {
                    extend(node,states.customization[url]);
                }
                changed = changed||hasChange(node,ndata);
                node.lastSeen = new Date();
                states.nodes[url] = node;
                if (changed) {
                    ret.push(node);
                    //console.log('changed or added',node);
                }
            }
        }
    });
    statesChanged();
    return ret;
    
}

function updateNodes(data,clientid) {
    var updatedNodes = parseNodes(data,clientid);
    if (updatedNodes.length)
        baseServer.broadcast(settings.baseTopic+"nodechange",updatedNodes);
    /*baseServer.mqttServer.publish({
        topic:settings.baseTopic+"nodechange",
        payload:JSON.stringify(updatedNodes),
        qos: 0, // 0, 1, or 2
        retain: false // or true
    },function(){
        console.log('update packet sent');
    });*/
}

baseServer.addTopicHandler("nodeupdate",function(topic,data,client) {
    //var data = parsePacket(packet);
    console.log('nodeupdate',data);
    if (data && data.length) {
        updateNodes(data,client.id.toString());
    }
});


baseServer.addTopicHandler("init",function(topic,data,client) {
    //var data = parsePacket(packet);
    //console.log('preinit',client.id);
    if (data && data.length) {
        updateNodes(data,client.id);
    }
        //parseNodes(data,String(client.id));

    //console.log('init',states);
    baseServer.broadcast(settings.baseTopic+"clientadded",client.id);
    /*baseServer.mqttServer.publish({
        topic:settings.baseTopic+"clientadded",
        payload:JSON.stringify(states),
        qos: 0, // 0, 1, or 2
        retain: false // or true
    },function(){
        console.log('init packet sent');
    });*/
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
});


baseServer.addApiHandler("customization",function(req,cb) {
    var obj = JSON.parse(req.data);
    console.log('customize',obj);
    states.customization[obj.id] = obj.data;
    var olditem = states.nodes[obj.id];
    updateNodes([olditem]);
    statesChanged();
    cb({ok:true});
});

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
    console.log('send state date',data);
    baseServer.broadcast(data.topic,data.state);
    cb({ok:true});
    /*baseServer.mqttServer.({
        topic:data.topic,
        payload:data.state,
        qos: 0, // 0, 1, or 2
        retain: false // or true
    },function(){
        cb(true);
    });*/
});

baseServer.addApiHandler("load",function(req,cb){
    var obj = dbCache[req.params[0]];
    cb(obj?obj:{});
});
