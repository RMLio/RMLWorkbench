var FetchManager = require('./FetchManager');
var MappingManager = require('./MappingManager');
var ScheduleManager = require('./ScheduleManager');
var method = SessionManager.prototype;
var fs = require('fs');
const chalk = require('chalk');

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
      //TODO proper id generating
      mapping.id = this._total;
      console.log(chalk.green('[WORKBENCH LOG]') + ' Mapping added: "'+mapping.filename+'"');
      console.log('[WORKBENCH LOG] Triples:');
      console.log(mapping.triples);     
      this._mappingPool.push(mapping);
   });

  res.send();
};

//fetch a source
method.fetchInput = function(req, res) {
      console.log('FETCH');
      this._total = this._total+1;
  		var input = this._fetchManager.uploadInput(req, (input) => {
        //TODO proper id generating
  		  input.id = this._total;
        console.log(chalk.green('[WORKBENCH LOG]') + 'Input added: "'+input.filename+'"');
        this._inputPool.push(input);
      });

  res.send();
};

//fetch a rdf
method.fetchRDF = function(req, res) {
      this._total = this._total+1;
  		var rdf = _fetchManager.uploadRDF(req, (rdf) => {
        //TODO proper id generating
        rdf.id = this._total;
        console.log(chalk.green('[WORKBENCH LOG]') + 'RDF added: "'+rdf.filename+'"');
        this._publishPool.push(rdf);
      });
      res.send();
};

//generate an rdf, mapping id is needed as param
method.generateRDF = function(req, res) {
  console.log('[WORKBENCH LOG] Generating RDF...');
  var mapping_id = req.params.mapping_id;
  var mappings = this._mappingPool;
  var mapping = method.findMapping(mapping_id, mappings);
  var sources = this._inputPool;
  var rdf = this._mappingManager.generateRDF(mapping, sources, (rdf) => {
    this._total = this._total+1;
    rdf.id = this._total;
    this._publishPool.push(rdf);
  });  
  res.send();
} 

method.getInputs = function(req, res) {
  console.log('[WORKBENCH LOG] Get inputs');
  res.send(this._inputPool);
};

method.getMappings = function(req, res) {
  console.log('[WORKBENCH LOG] Get mappings');
  res.send(this._mappingPool);
};

method.getRdf = function(req, res) {
  console.log('[WORKBENCH LOG] Get rdf');
  res.send(this._publishPool);
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
method.findMapping = function(id, data) {
  for(var i = 0; i < data.length; i++) {
    if(data[i].id == id) {
      return data[i];
    }
  }
};



//exporting module
module.exports = SessionManager;