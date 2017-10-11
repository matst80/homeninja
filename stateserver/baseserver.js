var mosca = require('mosca');
var url = require('url');
var path = require('path');
var fs = require('fs');
var http = require('http');
var ws = require("nodejs-websocket");
const map = require('./mimemap');
var wsServer;
var apiUrl = '/api/';
var dgram = require('dgram');
var dgramServer = dgram.createSocket("udp4"); 
var elasticServer;

var apiFunctions = {};
var topicFunctions = {};

function addToIndex(id,data,cb) {
    if (elasticServer && false) {
        var options = {
            "host": elasticServer.host,
            "path": elasticServer.baseUrl + id,
            "method": "POST",
            "headers": { 
              "Content-Type" : "application/json",
            }
          }
          
          callback = function(response) {
            var str = ''
            response.on('data', function(chunk){
              str += chunk
            })
          
            response.on('end', function(){
              if (cb)
              {}
            })
          }
          
          var body = JSON.stringify(data);
          http.request(options, callback).end(body);
    }
}

function createHttpServer() {
    var ret = http.createServer(function (req, res) {
        var lurl = req.url.toLocaleLowerCase();
        if (lurl=='/')
            lurl = '/index.htm';
        
        for(var i in apiFunctions) {
            if (lurl.startsWith(i))
            {
                function process(data) {
                    var add = lurl.substr(i.length+1);
                    addToIndex('apicall/',{url:i,data:data});
                    apiFunctions[i]({
                        params: add.split('/'),
                        data: data,
                        baseRequest:req
                    },function(d) {
			res.setHeader('Content-type', 'application/json' );
			res.setHeader('Access-Control-Allow-Origin', '*' );
                        res.end(JSON.stringify(d));
                    });
                } 
                if (req.method=="GET")
                        process('');
                else {
                    let body = [];
                    req.on('data', function(chunk) {
                        body.push(chunk);
                    }).on('end', function() {
                        process(Buffer.concat(body).toString());
                    });
                }
                
                return;
            }
        }
        
        
        const parsedUrl = url.parse(lurl);
        
        let pathname = './public'+parsedUrl.pathname;
        
        const ext = path.parse(pathname).ext;
        
        
        
        fs.exists(pathname, function (exist) {
            if(!exist) {
            // if the file is not found, return 404
            res.statusCode = 404;
            res.end('File ${pathname} not found!');
            return;
            }
        
            // if is a directory search for index file matching the extention
            if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;
        
            // read file from file system
            fs.readFile(pathname, function(err, data){
            if(err){
                res.statusCode = 500;
                res.end('Error getting the file: ${err}.');
            } else {
                // if the file is found, set Content-type and send data
                res.setHeader('Content-type', map[ext] || 'text/plain' );
                res.end(data);
            }
            });
        });    
    });
    /*wsServer = new ws({
        httpServer: ret,
        autoAcceptConnections: true
    });
    wsServer.on('request', function(request) {
        var connection = request.accept('echo-protocol', request.origin);
        console.log((new Date()) + ' Connection accepted.');
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log('Received Message: ' + message.utf8Data);
                connection.sendUTF(message.utf8Data);
            }
            else if (message.type === 'binary') {
                console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                connection.sendBytes(message.binaryData);
            }
        });
        connection.on('close', function(reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        });
    });*/
    return ret;
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

module.exports = function(settings) {
        elasticServer=settings.elasticsearch.baseUrl;

        dgramServer.bind(function() {
            dgramServer.setBroadcast(true);
            setInterval(broadcastNew, 3000);
        });
        
        function broadcastNew() {
            var message = new Buffer("homeninja-stateserver");
            dgramServer.send(message, 0, message.length, settings.broadcast.port||6024, settings.broadcast.addr||'255.255.255.255', function() {
                //console.log("Sent '" + message + "'");
            });
        }

        
        
        var wsserver = ws.createServer(function (conn) {
            console.log("New connection")
            conn.on("text", function (str) {
                console.log("Received "+str);
                var data = JSON.parse(str);
                if (data.topic) {

                }
                //conn.sendText(str.toUpperCase()+"!!!")
            })
            conn.on("close", function (code, reason) {
                console.log("Connection closed")
            })
        }).listen(8001);

        function wsBroadcast(topic,data) {
            var jsondata = JSON.stringify({topic:topic, data:data});
            wsserver.connections.forEach(function (conn) {
                console.log('send ws to client',conn.key);
                conn.sendText(jsondata);
            });
        }

        var httpServ = createHttpServer();
        var server = new mosca.Server(settings.mqttSettings);
        server.attachHttpServer(httpServ);
        server.on('published', function(packet, client) {
            if (client==null)
                return;
            console.log('got data',packet.topic,client.id);
            addToIndex('mqttstatus/',{topic:packet.topic,message:packet.toString()});
            var func = topicFunctions[String(packet.topic)];
            var data = parsePacket(packet);
            if (packet.topic.indexOf('$')==-1 && !func) {
                //wsBroadcast(packet.topic,data);
                //console.log('relay websocket',packet.topic);
            }
            //console.log('wsbroadcast');
            func&&func(packet.topic,data,client);
        });
    
        server.on('clientConnected', function(client) {
            console.log('client connected', client.id);
            addToIndex('mqttstatus/',{type:'connect',clientid:client.id});
        });
    
        server.on('clientDisconnected',function(client) {
            console.log('client disconnected', client.id);
            addToIndex('mqttstatus/',{type:'disconnect',clientid:client.id});
        });
    
        server.on('ready', function(){
            console.log('Waiting for connections');
        });

        httpServ.listen(settings.httpSettings.port);
        var ret = {
            addToIndex: addToIndex,
            addApiHandler:function(url,func) {
                apiFunctions[apiUrl+url] = func;
            },
            broadcast: function(topic,data,cb) {
                console.log('send broadcast data',topic);
                
                server.publish({
                    topic:topic,
                    payload:new Buffer(JSON.stringify(data)),
                    qos: 0, // 0, 1, or 2
                    retain: false // or true
                },function(){
                    if (cb)
                        cb(true);
                });
                wsBroadcast(topic,data);
            },
            //mqttServer:server,
            addTopicHandler:function(topic,func) {
                topicFunctions[settings.baseTopic+topic] = func;
            }
        };
        return ret;
    };
