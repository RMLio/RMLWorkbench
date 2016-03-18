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
  		this._mappingPool.push(input);

  		fs.unlink(req.file.path, function (err) {
    	if (err) throw err;
    	});
  	});

};

method.fetchInput = function(req, res) {

	fs.readFile(req.file.path, (err, data) => { //using arrow function, this has no 'this'
  		if (err) throw err;
      this._total = this._total+1;
  		var mapping = {
  						filename: req.file.originalname,
  						data : data,
  						metadata : 'empty',
              type : 'mapping',
              id : this._total
  						};
  		this._inputPool.push(mapping);
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
  var mapping;
  console.log(this._mappingPool);
  for(var i = 0; i < this._mappingPool.length; i++) {
    if(this._mappingPool[i].id == mapping_id) {
      mapping = this._mappingPool[i];
    }
  }
  console.log(mapping.data);
  this._mappingManager.generateRDF(mapping);
  res.send();
} 

method.executeMapping = function(req, res) {
	//TODO
	console.log('[WORKBENCH LOG] Execute mapping');
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
var findMapping = function(id) {
  console.log(this._name);
  for(var i = 0; i < this._mappingPool.length; i++) {
    if(this._mappingPool[i].id === id) {
      return this._mappingPool[i];
    }
  }
};


//exporting module
module.exports = SessionManager;