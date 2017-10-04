module.exports = {
    server:'10.10.10.1',
    serverPort:3000,
    mqttPort:1884,
    baseTopic: 'dnsleases/',
    sendInterval: 60,
    leaseFile: '/var/lib/misc/dnsmasq.leases'
};
