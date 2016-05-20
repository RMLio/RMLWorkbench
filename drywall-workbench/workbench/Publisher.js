var fs = require('fs');
var spawner = require('child_process');

var publishings = 0;

console.log("PUBLISHER STARTED");

var exports = module.exports = {


    publishToLDF: function (context, callback) {

        console.log('[WORKBENCH LOG] Publishing:')
        publishings++;
        console.log(context);

        //read configuration file (JSON) from local ldf server and add the new content
        var obj = require('../ldf_server/config.json');

        //count how many datasources there are in the local ldf server
        var key, count = 0;
        for (key in obj.datasources) {
            if (obj.datasources.hasOwnProperty(key)) {
                count++;
            }
        }

        //add request context (JSON) to config file of ldf server
        obj.datasources['data_' + count] = context.dataset;

        fs.writeFileSync('./ldf_server/' + context.filename, context.data);
        console.log("[WORKBENCH LOG] Writing file...");
        //write the config file back
        //Why is the path different? --> using fs
        publishings--;
        fs.writeFileSync('./ldf_server/config.json', JSON.stringify(obj));
        console.log("[WORKBENCH LOG] Data added to local LDF server!");
        if (publishings == 0) {
            console.log("[WORKBENCH LOG] Restarting LDF server...");
            spawner.exec('fuser -n tcp -k 5000', function () {
                spawner.exec('(cd ldf_server/; ldf-server config.json 5000)', function () {
                });
                if (callback != undefined) {
                    callback();
                }
            });
        } else {
            if (callback != undefined) {
                callback();
            }
        }


    }
}