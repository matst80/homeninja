var mongoBaseUrl = "mongodb://10.10.10.1:27017/";

module.exports = {
    baseTopic: "homeninja/",
    usn: [//'upnp:rootdevice',
        //'urn:schemas-upnp-org:device:MediaServer:1',
        'urn:schemas-upnp-org:service:ContentDirectory:1'
        //'urn:schemas-upnp-org:service:ConnectionManager:1'
    ],
    elasticsearch:  {
        baseUrl: '/es/homeninaja/',
        host: 'fw.knatofs.se:8083'
    },
    httpSettings:{
        port:3000
    },
    mqttSettings: {
        port: 1884,
        /*http: {
            port: 3000,
            bundle: true,
            static: './public'
        },*/
        backend: {
            type: 'mongo',
            url: mongoBaseUrl + 'homepersistance2',
            pubsubCollection: 'ascoltatori',
            mongo: {

            }
        }
    },
    mongoPersistanceUrl: mongoBaseUrl + 'homeninja'
};
