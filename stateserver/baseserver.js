var mosca = require('mosca');
var url = require('url');
var path = require('path');
var fs = require('fs');
var http = require('http');
var ws = require('websocket').server;
const map = require('./mimemap');
var wsServer;
var apiUrl = '/api/';

var apiFunctions = {};
var topicFunctions = {};

function addToIndex(id,data,cb) {
    if (settings.elasticsearch) {
        var options = {
            "host": settings.elasticsearch.host,
            "path": settings.elasticsearch.baseUrl + id,
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
          https.request(options, callback).end(body);
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

module.exports = function(settings) {
        var httpServ = createHttpServer();
        var server = new mosca.Server(settings.mqttSettings);
        server.attachHttpServer(httpServ);
        server.on('published', function(packet, client) {
            console.log('got data',packet.topic);
            addToIndex('mqttstatus/',{topic:packet.topic,message:packet.toString()});
            var func = topicFunctions[String(packet.topic)];
            func&&func(packet,client);
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
            mqttServer:server,
            addTopicHandler:function(topic,func) {
                topicFunctions[settings.baseTopic+topic] = func;
            }
        };
        return ret;
    };