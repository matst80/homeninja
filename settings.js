var mongoBaseUrl = "mongodb://localhost:27017/";

module.exports = {
    baseTopic: "homeninja/",
    usn: [//'upnp:rootdevice',
        //'urn:schemas-upnp-org:device:MediaServer:1',
        'urn:schemas-upnp-org:service:ContentDirectory:1'
        //'urn:schemas-upnp-org:service:ConnectionManager:1'
    ],
    httpSettings:{
        port:3000
    },
    mqttSettings: {
        port: 1883,
        /*http: {
            port: 3000,
            bundle: true,
            static: './public'
        },*/
        backend: {
            type: 'mongo',
            url: mongoBaseUrl + 'homepersistance',
            pubsubCollection: 'ascoltatori',
            mongo: {

            }
        }
    },
    mongoPersistanceUrl: mongoBaseUrl + 'homeninja'
};