var fs = require('fs');

//publish data on the local LDF server
exports.publishLDF = function(req, res) {    
    
    //read configuration file (JSON) from ldf server and add the new content
    var obj = require('../../config.json');
    
    //temporarly solution
    obj.datasources.example1 = {
                "title": "My First Publish (RDF)",
                "type": "TurtleDatasource",
                "description": "This is my first published item on a LDF server!",
                "settings": { "file": "./output.rdf" }
                };             
    
    //write the config file back    
    //Why is the path different?
    fs.writeFile('./config.json', JSON.stringify(obj), function (err) {
        if(err) {
            return console.log('error!' + err);
        }    
    console.log("Data added to local LDF server!");    
    res.status(200);
    res.redirect('/workbench');
    res.send;
}); 
}


//for in the future
exports.publishVirtuoso = function(req, res) {    
    // TO DO
    console.log("Exporting on Virtuoso server!");
}