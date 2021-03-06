var fs = require('fs'),
settings = require("./settings"),
homeninja = require("../nodehelper/nodehelper").init(settings),
ping = require('ping'),
leaseList = [];

var firstSend = true;

function mergeList(lst) {
  var changed = [];
  lst.map(function(i) {
    console.log(i);
  });
}

function sendDevices() {
  fs.readFile(settings.leaseFile, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var leases = [];
    data.split('\n').forEach(function(line) {
      var parts = line.split(' ');
      var lease = {
        features: ['binarysensor','presence','iplease'],
        topic: 'devices/'+parts[1],
        state: true,
        ip: parts[2],
        mac: parts[1],
        name: parts[3]
      };
      ping.sys.probe(parts[2], function(isAlive){
        var msg = isAlive ? 'host ' + parts[3] + ' is alive' : 'host ' + parts[3] + ' is dead';
        lease.state = isAlive;
        console.log(msg);
      });
      if (lease.name && lease.name!='*') {
      if (!firstSend)
        homeninja.updateNode([lease]);
        leases.push(lease);
      }
    });
    mergeList(leases);
    if (firstSend) {
      homeninja.sendNodes(leases);
      firstSend = false;
    }
    //console.log(leases);
  });
  setTimeout(sendDevices,settings.sendInterval*1000);
}

homeninja.on('connect',function() {
  sendDevices();
});