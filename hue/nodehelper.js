var mqtt = require('mqtt');
var http = require('http');
const EventEmitter = require('events').EventEmitter;
const eventEmitter = new EventEmitter();
var connected = false;
var baseTopic = 'homeninja/';

function apiRequest(opt,cb) {
    opt.headers = {
        'Content-Type': 'application/json',
        'Content-Length': opt.data?opt.data.length:0
      };
    var ret = [];
    var req = http.request(opt,function(res) {
        res.on('data',function(c){
            ret.push(c);//ret+=c.toString();
        });
        res.on('end',function() {
            cb(Buffer.concat(ret).toString());
        });
    });
    if (opt.data)
        req.write(opt.data);
    req.end();
}

module.exports = {
    init:function(settings) {
        var client = mqtt.connect('mqtt://'+settings.server);
        client.subscribe('');
        client.on('connect', function () {
            connected = true;
            console.log('connected..');
            eventEmitter.emit('connect');
        });
        client.on('disconnect', function () {
            connected = true;
            console.log('disconnected..');
            lastNodes = {};
            eventEmitter.emit('disconnect');
        });

        function compareNodes(nodes) {
            // add logic here
            return nodes;
        }
        var lastNodes = {};

        var ret = {
            nodes: {},
            on: function(evt,cb) {
                eventEmitter.on(evt,cb);
            },
            client: client,
            load: function(key,cb) {
                apiRequest({
                    hostname:settings.settings,
                    port:settings.serverPort||3000,
                    path:'/api/load/'+key,
                    method: 'GET'
                },function(d){
                    cb(JSON.parse(d));
                });
            },
            sendNodes: function(nodes) {
                lastNodes = nodes;
                client.publish(baseTopic+'init',JSON.stringify(nodes));
            },
            sendNotification: function(data) {
                client.publish(baseTopic+'notify',data);
            },
            sendRichNotification: function(data) {
                client.publish(baseTopic+'richnotify',JSON.stringify(data));
            },
            save: function(key,data,cb) {
                apiRequest({
                    hostname:settings.settings,
                    port:settings.serverPort||3000,
                    path:'/api/save/'+key,
                    method: 'POST',
                    data:JSON.stringify(data)
                },cb);
            },
            sendState: function(data) {

            }
        };
        return ret;
    }
};