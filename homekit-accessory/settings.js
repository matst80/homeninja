module.exports = {
    server:'fw.knatofs.se',
    serverPort:3000,
    mqttPort:1884,
    baseTopic: 'dnsleases/',
    sendInterval: 60,
    leaseFile: '/var/lib/misc/dnsmasq.leases'
};
