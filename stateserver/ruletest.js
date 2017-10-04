var rules = {};
const vm = require('vm');

var baseServer = {
    mqttServer: {
        on:function(evt,cb) {
            console.log('server on called');
            setInterval(cb,1000);
        }
    }
};

const contextSandbox = {
    homeninja: baseServer,
    log: function(a,b) {
        console.log.apply(this,arguments); 
    }
}
const context = new vm.createContext(contextSandbox);

function addRule(id,title,data) {
    var scr = new vm.Script(data,{filename:id+'.js',displayErrors:true});
    scr.runInContext(context);
    var ret = rules[id] = {
        id: id,
        title: title,
        scrtip: scr,
        sDate: data
    };
    return ret;
}

var testrule = 
'    log("run rule");i++;console.log("hoho");'+
'    homeninja.mqttServer.on("published", function(packet, client) {'+
'        log("got data in rule");'+
'    });';

addRule('tst','test',testrule);
console.log(contextSandbox);
