var fs = require('fs');
var settings = require("./settings");

homeninja.on('connect',function() {
  fs.readFile(settings.leaseFile, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var leases = [];
    data.split('\n').forEach(function(line) {
      var parts = line.split(' ');
      var lease = {
          topic: 'devices/'+mac,
          ip: parts[2],
          mac: parts[1],
          name: parts[3]
      };
      if (lease.name && lease.name!='*')
          leases.push(lease);
      
    });
    homeninja.sendNodes(leases);
    console.log(leases);
  });
});