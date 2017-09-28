module.exports = {
    isEmptyObject: function (obj) {
        for(var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
            }
        }
        return true;
    },
    pathJoin: function() {
        var ret = [];
        for(var i in arguments) {
            ret.push(arguments[i].replace(/\/$/, ""));
        }
        return ret.join('/');
    },
    each: function (o,cb) {
        var ret = [];
        for(i in o) {
            ret.push(cb(o[i],i));
        }
        return ret;
    },
    findNode: function(topic,nodes,cb) {
        nodes.forEach(function(n){
            if (topic.startsWith(n.topic+'/')) {
                cb(n);
            }
        });
    }
}