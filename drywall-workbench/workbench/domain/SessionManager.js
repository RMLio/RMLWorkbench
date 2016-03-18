var FetchManager = require('./FetchManager');
var MappingManager = require('./MappingManager');
var ScheduleManager = require('./ScheduleManager');
var method = SessionManager.prototype;
var fs = require('fs');

//this class represents a single workbench session
function SessionManager() {
    this._mappingManager = new MappingManager();
    this._fetchManager = new FetchManager();
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

//fetch a mapping
method.fetchMapping = function(req, res) {
  this._total = this._total+1;
  var mapping = this._fetchManager.uploadMapping(req, (mapping) => {
      mapping.id = this._total;
      console.log('[WORKBENCH LOG] Mapping added: "'+mapping.filename+'"');      
      this._mappingPool.push(mapping);
   });
};

//fetch a mapping
method.fetchInput = function(req, res) {
      this._total = this._total+1;
  		var input = this._fetchManager.uploadInput(req, (input) => {
  		  input.id = this._total;
        console.log('[WORKBENCH LOG] Input added: "'+input.filename+'"');
        this._inputPool.push(input);
      });
};

//fetch a mapping
method.fetchRDF = function(req, res) {
      this._total = this._total+1;
  		var rdf = _fetchManager.uploadRDF(req, (rdf) => {
        rdf.id = this._total;
        console.log('[WORKBENCH LOG] RDF added: "'+rdf.filename+'"');
        this._publishPool.push(rdf);
      });
};

//generate an rdf, mapping id is needed as param
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






//exporting module
module.exports = SessionManager;