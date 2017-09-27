var mosca = require('mosca');
var url = require('url');
var path = require('path');
var fs = require('fs');
var http = require('http');

const map = require('./mimemap');

var apiUrl = '/api/';

var apiFunctions = {};
var topicFunctions = {};

function createHttpServer() {
    return http.createServer(function (req, res) {
        var lurl = req.url.toLocaleLowerCase();
        if (lurl=='/')
            lurl = '/index.htm';
        
        for(var i in apiFunctions) {
            if (lurl.startsWith(i))
            {
                function process(data) {
                    var add = lurl.substr(i.length+1);
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
}

module.exports = function(settings) {
        var httpServ = createHttpServer();
        var server = new mosca.Server(settings.mqttSettings);
        server.attachHttpServer(httpServ);
        server.on('published', function(packet, client) {
            console.log('got data',packet.topic);
            var func = topicFunctions[String(packet.topic)];
            func&&func(packet,client);
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

        httpServ.listen(settings.httpSettings.port);
        var ret = {
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