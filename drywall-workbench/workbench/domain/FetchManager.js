var Fetcher = require('./Fetcher'); //maybe not necessary
var method = FetchManager.prototype;
var mongoose = require('mongoose');
var fs = require('fs');


function FetchManager() {
    this._fetcher = new Fetcher();    
}

//upload rdf
method.uploadRDF = function(file, callback) {
	fs.readFile(file.path, 'utf8',(err, data) => { //using arrow function, this has no 'this'
      if (err) throw err;
      var rdf = {
              filename: file.originalname,
              data : data,
              metadata : 'empty',
              type : 'rdf',
              _id : mongoose.Types.ObjectId()
              };
      fs.unlink(file.path, function (err) {
        if (err) throw err;
      });
      callback(rdf);
    });
};

//upload input
method.uploadInput = function(file, callback) {
  fs.readFile(file.path, 'utf8', (err, data) => { //using arrow function, this has no 'this'
      if (err) throw err;
      var input = {
              filename: file.originalname,
              data : data,
              metadata : 'empty',
              type : 'input',
              _id : mongoose.Types.ObjectId()
              };        
      fs.unlink(file.path, function (err) {
      if (err) throw err;
      });
      callback(input);
    });
}

//upload a mapping
method.uploadMapping = function(file, callback) {
	var mapping;
	fs.readFile(file.path, 'utf8', (err, data) => { //using arrow function, this has no 'this'
  		if (err) throw err;      
  		mapping = {
  						filename: file.originalname,
  						data : data,
  						metadata : 'empty',
              type : 'mapping',
              _id : mongoose.Types.ObjectId(),
              triples: []
  						};
      mapping.triples = method.parseTriples(mapping);
  		fs.unlink(file.path, function (err) {
    	if (err) throw err;
    	}); 
  		callback(mapping);
  	});
  	
  	
}

method.downloadFromAPI = function() {
	//TODO
	return input;
};

method.downloadFromURI = function(download) {
	//TODO
	return input;
};


/*
* Utility functions
*/

//parse triples of a local mapping file
method.parseTriples = function(mapping) {
  var content = mapping.data.replace(/(?:\r\n|\r|\n|\t)/g, ' ');
  content = content.split(" ");
  var triples = [];
  var triple = false;
  var newTriple;

  //parse mapping
  for(var i = 0; i < content.length; i++) {

    //check for triple name
    if(!triple && content[i].substring(0, 2) == '<#') {
      //new triple found
      newTriple = {
        title : content[i].replace(/[><#]+/g, ''),   
        local : true  
      };
      triple = true;
    }

    //check for logicalsource
    if(triple && content[i] == 'rml:logicalSource') {
      newTriple.logicalsource = {};
    }

    //check for rml:source 
    if(triple && content[i] == 'rml:source') {
        var source = content[i+1].replace(/['";]+/g, '');
        //check if local or not
        if(source.substring(0, 4) == 'http' || source.substring(0,2) == '<#') {
            newTriple.local = false;
        }
        source.replace(/[><#]+/g, '');
        var regex = /(\w*\.\w*)$/;  //match filename
        var match = regex.exec(source);
        newTriple.logicalsource.rmlsource = match[0];
    }

    //check for rml:referenceFormulation
    if(triple && content[i] == 'rml:referenceFormulation') {
        var reference = content[i+1].replace(/['";]+/g, '');        
        reference.replace(/[><#]+/g, '');
        newTriple.logicalsource.rmlreferenceformulation = reference;
    }

    //check for iterator
    if(triple && content[i] == 'rml:iterator') {
        var iterator = content[i+1].replace(/['";]+/g, '');        
        newTriple.logicalsource.rmliterator = iterator;
    }

    //check for sqlversion
    if(triple && content[i] == 'rr:sqlversion') {
        var version = content[i+1].replace(/['";]+/g, '');        
        newTriple.logicalsource.rrsqlversion = version;
    }

    //check for query
    if(triple && content[i] == 'rr:query') {
        var queryn = content[i+1].replace(/['";]+/g, '');        
        newTriple.logicalsource.rrquery = query;
    }

    //check if triple has ended
    if(content[i] == '].') {
      triple = false;
      triples.push(newTriple);
    }

    //TO DO SERVICE DATADESCRIPTION
    
  }
  return triples;
}

//exporting module
module.exports = FetchManager;