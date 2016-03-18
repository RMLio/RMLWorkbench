var InputManager = require('./InputManager');
var MappingManager = require('./MappingManager');
var ScheduleManager = require('./ScheduleManager');
var method = SessionManager.prototype;
var fs = require('fs');

//this class represents a single workbench session
function SessionManager() {
    this._mappingManager = new MappingManager();
    this._inputManager = new InputManager();
    this._scheduleManager = new ScheduleManager();
    this._inputPool = [];
    this._mappingPool = [];
    this._publishPool = [];
    this._total = 0;
    this._name = 'Wouter';
}


method.logContent = function(req, res) {
	console.log(this._mappingPool);
}

/*
* Functions available for the API
*/
SessionManager.prototype.fetchMapping = function(req, res) {

	fs.readFile(req.file.path, 'utf8', (err, data) => { //using arrow function, this has no 'this'
  		if (err) throw err;
      this._total = this._total+1;
  		var mapping = {
  						filename: req.file.originalname,
  						data : data,
  						metadata : 'empty',
              type : 'mapping',
              id : this._total,
              triples: []
  						};
      mapping.triples = method.parseTriples(mapping);
      console.log(mapping.triples);    
  		this._mappingPool.push(mapping);
  		fs.unlink(req.file.path, function (err) {
    	if (err) throw err;
    	});
  	});

};

method.fetchInput = function(req, res) {

	fs.readFile(req.file.path, (err, data) => { //using arrow function, this has no 'this'
  		if (err) throw err;
      this._total = this._total+1;
  		var input = {
  						filename: req.file.originalname,
  						data : data,
  						metadata : 'empty',
              type : 'input',
              id : this._total
  						};        
  		this._inputPool.push(input);
  		fs.unlink(req.file.path, function (err) {
    	if (err) throw err;
    	});
  	});

};

method.fetchRDF = function(req, res) {

	fs.readFile(req.file.path, (err, data) => { //using arrow function, this has no 'this'
  		if (err) throw err;
      this._total = this._total+1;
  		var rdf = {
  						filename: req.file.originalname,
  						data : data,
  						metadata : 'empty',
              type : 'rdf',
              id : this._total
  						};
  		this._publishPool.push(rdf);
  		fs.unlink(req.file.path, function (err) {
    		if (err) throw err;
    	});
  	});

};

method.generateRDF = function(req, res) {
  var mapping_id = req.params.mapping_id;
  var mappings = this._mappingPool;
  var mapping = method.findData(mapping_id, mappings);
  console.log(mapping.data);
  this._mappingManager.generateRDF(mapping);
  res.send();
} 

method.getInputs = function(req, res) {
  //TODO
  console.log('[WORKBENCH LOG] Get inputs');
};

method.getMappings = function(req, res) {
  //TODO
  console.log('[WORKBENCH LOG] Get mappings');
};

method.getRDF = function(req, res) {
  //TODO
  console.log('[WORKBENCH LOG] Get rdf');
};

method.addInputSchedule = function(req, res) {
	//TODO
	console.log('[WORKBENCH LOG] Add Input Schedule');
};

method.addMappingSchedule = function(req, res) {
	//TODO
	console.log('[WORKBENCH LOG] Add Mapping Schedule');
};

method.addPublishSchedule = function(req, res) {
	//TODO
	console.log('[WORKBENCH LOG] Add Publish Schedule');
};

/*
* Utility functions
*/

//find mapping by id
method.findData = function(id, data) {
  for(var i = 0; i < data.length; i++) {
    if(data[i].id == id) {
      return data[i];
    }
  }
};



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
        source : ''      
      };
      triple = true;
    }

    //check for source
    if(triple && content[i] == 'rml:source') {
        var source = content[i+1].replace(/['"]+/g, '').replace(/[><#]+/g, '');
        newTriple.source = source;
    }

    //check if triple has ended
    if(content[i] == '].') {
      triple = false;
      triples.push(newTriple);
    }
    
  }
  return triples;
}


//exporting module
module.exports = SessionManager;