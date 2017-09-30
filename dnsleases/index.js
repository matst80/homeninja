var fs = require('fs'),
    settings = require("./settings"),
    homeninja = require("../nodehelper/nodehelper").init(settings);

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
          ip: parts[2],
          mac: parts[1],
          name: parts[3]
      };
      if (lease.name && lease.name!='*')
          leases.push(lease);
      
    });
    homeninja.sendNodes(leases);
    //console.log(leases);
  });
  setTimeout(sendDevices,settings.sendInterval*1000);
}

homeninja.on('connect',function() {
  sendDevices();
});