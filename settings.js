var mongoBaseUrl = "mongodb://localhost:27017/";

module.exports = {
    baseTopic: "homeninja/",
    mqttSettings: {
        port: 1883,
        http: {
            port: 3000,
            bundle: true,
            static: './public'
        },
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