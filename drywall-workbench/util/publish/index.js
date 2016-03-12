var fs = require('fs');

//publish data on the local LDF server
exports.publishLdf = function(req, res) {    
           
    //read configuration file (JSON) from ldf server and add the new content
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
    //Why is the path different?
    fs.writeFile('./config.json', JSON.stringify(obj), function (err) {
        if(err) {
            return console.log('error!' + err);
        }    
    console.log("[APPLICATION LOG] Data added to local LDF server!");    
    res.status(200);
    res.send();
}); 
}


//for in the future
exports.publishVirtuoso = function(req, res) {    
    // TO DO
    console.log("Exporting on Virtuoso server!");
}