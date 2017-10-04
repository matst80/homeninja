module.exports = {
    server:'10.10.10.1',
    serverPort:3000,
    mqttPort:1884,
    baseTopic: 'tradfri/',
    broadcastPort: 6024,
    hubSettings: {
        securityId: "uDPchBVBLOQndJEn", 
        hubIpAddress: "10.10.10.175"
    },
    bridgeConfigKey: 'tradfri-node-bridges',
    bridges: {
        "001788fffe2985e3":{
            username:"pQd2VpM-O7lObKo7u7K7cjfQQu21eZnCFCsdX3qX",
            ip: '10.10.10.116'
        }
    }
};