var fs = require('fs');
var path = require('path');
var ldfEventEmitter = require('../events/events').ldfEventEmitter;


//publish data on the local LDF server
exports.publishLdf = function(req, res) {    
           
    //read configuration file (JSON) from local ldf server and add the new content
    var obj = require('../../config.json');
    
    //count how many datasources there are in the local ldf server   
    var key, count = 0;
    for(key in obj.datasources) {
        if(obj.datasources.hasOwnProperty(key)) {
            count++;
        }
    }   
    
    //add request body (JSON) to config file of ldf server
    obj.datasources['data_' + count] = req.body;             
    
    //write the config file back    
    //Why is the path different? --> using fs
    fs.writeFile('./config.json', JSON.stringify(obj), function (err) {
        if(err) {
            return console.log('error!' + err);
        }    
    console.log("[APPLICATION LOG] Data added to local LDF server!");    
    res.status(200);
    res.send();
    
    ldfEventEmitter.emit('restart');
}); 
}


//for in the future
exports.publishVirtuoso = function(req, res) {    
    // TO DO
    console.log("Publishing on Virtuoso server!");
}

//get available files for publishing from server
exports.getFiles = function(req,res) {
    var files = fs.readdirSync('./');
    var filesFiltered = [];
    files.forEach(function(file) {        
        if(path.extname(file)==='.rdf') {
            filesFiltered.push(
                {
                    name: file,
                    url: './' + file
                }   
            );
        }
    });
    res.status(200);
    res.send(filesFiltered);
}