fs = require('fs');
var dnsFile = '/var/lib/misc/dnsmasq.leases';
//var dnsFile = './test.leases';
fs.readFile(dnsFile, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var leases = [];
  data.split('\n').forEach(function(line) {
    var parts = line.split(' ');
    var lease = {
        ip: parts[2],
        mac: parts[1],
        name: parts[3]
    };
    if (lease.name && lease.name!='*')
        leases.push(lease);
  });
  console.log(leases);
});

