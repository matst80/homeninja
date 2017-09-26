var mongoBaseUrl = "mongodb://localhost:27017/";

module.exports = {
    baseTopic: "homeninja/",
    mqttSettings: {
        port: 1883,
        backend: {
            type: 'mongo',
            url: mongoBaseUrl + 'homepersistance',
            pubsubCollection: 'ascoltatori',
            mongo: {}
        }
    },
    mongoPersistanceUrl: mongoBaseUrl + 'homeninja'
};