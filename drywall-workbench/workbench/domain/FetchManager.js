var Fetcher = require('./Fetcher'); //maybe not necessary
var method = FetchManager.prototype;
var fs = require('fs');


function FetchManager() {
    this._fetcher = new Fetcher();    
}

method.generateConfiguration = function(_uploads, _downloads) {
	var configuration = {
							configuration: 'input',
							uploads: _uploads,
							downlaods: _downloads
						};
	return configuration;
}

method.executeConfiguration = function(configuration) {
	for(upload in configuration.uploads) {
		method.uploadInput(upload);
	}

	for(download in configuration.downloads) {
		method.downloadInput(download);
	}
};

//upload rdf
method.uploadRDF = function(req, callback) {
	fs.readFile(req.file.path, (err, data) => { //using arrow function, this has no 'this'
      if (err) throw err;
      var rdf = {
              filename: req.file.originalname,
              data : data,
              metadata : 'empty',
              type : 'rdf',
              id : 0
              };
      fs.unlink(req.file.path, function (err) {
        if (err) throw err;
      });
      callback(rdf);
    });
};

//upload input
method.uploadInput = function(req, callback) {
  console.log('!!!');
  console.log(req.file);
  fs.readFile(req.file.path, (err, data) => { //using arrow function, this has no 'this'
      if (err) throw err;
      var input = {
              filename: req.file.originalname,
              data : data,
              metadata : 'empty',
              type : 'input',
              id : this._total
              };        
      fs.unlink(req.file.path, function (err) {
      if (err) throw err;
      });
      callback(input);
    });
}

//upload a mapping
method.uploadMapping = function(req, callback) {
	var mapping;
	fs.readFile(req.file.path, 'utf8', (err, data) => { //using arrow function, this has no 'this'
  		if (err) throw err;      
  		mapping = {
  						filename: req.file.originalname,
  						data : data,
  						metadata : 'empty',
              type : 'mapping',
              id : 0,
              triples: []
  						};
      mapping.triples = method.parseTriples(mapping);
  		fs.unlink(req.file.path, function (err) {
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

//find triple of a local mapping file
method.parseTriples = function(mapping) {
  var content = mapping.data.replace(/(?:\r\n|\r|\n)/g, ' ');
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
        if(source.substring(0, 4) == 'http' || source.substring(0,2) == '<#') {
            newTriple.local = false;
        }
        source.replace(/[><#]+/g, '');
        newTriple.logicalsource.rmlsource = source;
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